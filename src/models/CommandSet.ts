import fs from "fs";
import path from "path";

import { Message } from "discord.js";

import { Command } from "./Command";
import { Com } from "../com";
import { CommandResultUtils, CommandResult } from "./CommandResult";
import { ParseOptions } from "./ParseOptions";

import defaultLocalization from "../data/localization.json";
import { deepMerge } from "../utils/deepMerge";
import { DeepPartial } from "../utils/DeepPartial";
import { HelpUtility } from "../other/HelpUtility";
import { template } from "../utils/template";
import { CommandResultError } from "./CommandResultError";
import { CommandCollection, ReadonlyCommandCollection } from "./CommandCollection";

export class CommandSet {

    private _commands = new CommandCollection();

    constructor(private _defaultOptions?: DeepPartial<ParseOptions>) { }

    get commands() { return this._commands as ReadonlyCommandCollection; }

    private _loadFile(path: string) {
        try {
            const commandData = require(path).default;
            const command = Command.build(this, commandData);
            if (command.ignored) Com.warn(`Command ignored (${path})`);
            else {
                if (!this._commands.add(command)) Com.warn(`Command name already taken (${path})`);
            }
        } catch (e) {
            Com.error(`Fail to load command at ${path} :`, e);
        }
    }

    /**
     * Load command from the given folder path.<br>
     * Command file must have the extension `.cmd.js`
     * @param commandDirPath - path to the folder where the commands are (relative to node entry point).
     */
    loadCommands(commandDirPath: string) {
        try {
            if (require.main)
                commandDirPath = path.resolve(path.dirname(require.main.filename), commandDirPath);
            const cmdFiles = fs.readdirSync(commandDirPath).filter(file => file.endsWith('.cmd.js'));
            for (const file of cmdFiles) {
                const filePath = path.resolve(path.format({ dir: commandDirPath, base: file }));
                this._loadFile(filePath);
            }
        } catch (e) {
            Com.error(`Fail to load commands in ${commandDirPath} :`, e);
        }
    }

    /**
     * Load build-in commands.<br>
     * `help`, `list`<br>
     * `all` to load all build-in commands.
     * @param buildinCommandNames - a list of build-in command name to load.
     */
    buildin(...buildinCommandNames: string[]) {
        if (buildinCommandNames.includes("all")) {
            this.loadCommands(__dirname + "/../commands");
        } else {
            for (const name of buildinCommandNames) {
                const filePath = path.resolve(path.format({ dir: __dirname + "../commands", name: name, ext: ".cmd.js" }));
                if (fs.existsSync(filePath))
                    this._loadFile(filePath);
            }
        }
    }

    get(commandName: string) {
        return this._commands.get(commandName);
    }

    /** @internal */
    resolve(args: readonly string[]) {
        const _args = [...args]; // make a copy of args
        let cmd = this.get(_args[0]);

        if (cmd) {
            let sub: Command | undefined = cmd;
            do {
                cmd = sub;
                _args.shift();
                sub = cmd.subs.get(_args[0]);
            } while (sub);

            return { command: cmd, args: _args };
        } else {
            return { args: _args };
        }
    }

    /**
     * Check if there is a command in the given message and execute it.
     * @param message
     * @param context - a context object that is send to command when executed. (can store database or other data)
     * @param options - option de define the behaviour of the command parser.
     */
    async parse(message: Message, options?: DeepPartial<ParseOptions>): Promise<CommandResult> {

        function OptionsError(paramName: string) { return new Error(`Invalid options value: "${paramName}" is invalid.`); }

        const opts = deepMerge({}, defaultOptions, this._defaultOptions, options);

        // check options
        if (opts.listCommandPerPage < 1)
            throw OptionsError("listCommandPerPage");

        // Extract command & arguments from message
        if (!message.content.startsWith(opts.prefix)) return CommandResultUtils.notPrefixed();

        // extract the command & arguments from message
        const rawArgs = (message.content.substring(opts.prefix.length).match(/[^\s"']+|"([^"]*)"|'([^']*)'/g) || [])
            .map(a => /^(".*"|'.*')$/.test(a) ? a.substring(1, a.length - 1) : a);

        const { command, args } = this.resolve(rawArgs);

        if (!command) {
            if (opts.deleteMessageIfCommandNotFound && message.channel.type === 'text') await message.delete().catch(() => { });
            return CommandResultUtils.commandNotFound();
        }

        if (command.deleteCommand && message.channel.type === 'text') await message.delete().catch(() => { });

        if (command.guildOnly && !message.guild) {
            await message.reply(template(opts.localization.misc.guildOnlyWarning, { command: HelpUtility.Command.fullName(command) }));
            return CommandResultUtils.guildOnly(command);
        }

        if (command.devOnly && !(opts.devIDs.includes(message.author.id))) return CommandResultUtils.devOnly(command);

        try {
            return CommandResultUtils.ok(command, await command.execute(message, args, opts, this));
        } catch (e) {
            if (e instanceof CommandResultError) {
                if (e.replyMessage && e.replyMessage !== "") await message.reply(e.replyMessage).catch(() => { });
                return e.commandResult;
            }
            else
                return CommandResultUtils.error(e);
        }
    }
}

/** @internal */
const defaultOptions: ParseOptions = {
    prefix: "",
    helpOnSignatureNotFound: true,
    deleteMessageIfCommandNotFound: true,
    devIDs: [],
    listCommandPerPage: 5,
    localization: defaultLocalization,
};