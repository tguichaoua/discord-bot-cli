import fs from "fs";
import path from "path";

import { Message } from "discord.js";

import { Command } from "./Command";
import { Logger } from "../logger";
import { CommandResultUtils, CommandResult } from "./CommandResult";
import { ParseOptions } from "./ParseOptions";

import defaultLocalization from "../data/localization.json";
import { deepMerge } from "../utils/deepMerge";
import { DeepPartial } from "../utils/DeepPartial";
import { HelpUtils } from "../other/HelpUtils";
import { template } from "../utils/template";
import { CommandResultError } from "./CommandResultError";
import {
    CommandCollection,
    ReadonlyCommandCollection,
} from "./CommandCollection";

type BuildInCommand = "help" | "list" | "cmd";

export class CommandSet {
    private _commands = new CommandCollection();

    constructor(private _defaultOptions?: DeepPartial<ParseOptions>) {}

    get commands() {
        return this._commands as ReadonlyCommandCollection;
    }

    private _loadFile(path: string) {
        try {
            const command = Command.load(path, this);
            if (command.ignored) Logger.warn(`Command ignored (${path})`);
            else {
                if (!this._commands.add(command))
                    Logger.warn(`Command name already taken (${path})`);
            }
        } catch (e) {
            Logger.error(`Fail to load command at ${path} :`, e);
        }
    }

    /**
     * Load command from the given folder path.<br>
     * Command file must have the extension `.cmd.js`
     * @param commandDirPath - path to the folder where the commands are (relative to node entry point).
     * @param includeTS - if set to true, file with `.cmd.ts` extension are also loaded. Usefull if you use `ts-node` (default is false)
     */
    loadCommands(commandDirPath: string, includeTS = false) {
        try {
            if (require.main)
                commandDirPath = path.resolve(
                    path.dirname(require.main.filename),
                    commandDirPath
                );
            const cmdFiles = fs
                .readdirSync(commandDirPath)
                .filter(
                    (file) =>
                        file.endsWith(".cmd.js") ||
                        (includeTS && file.endsWith(".cmd.ts"))
                );
            for (const file of cmdFiles) {
                const filePath = path.resolve(
                    path.format({ dir: commandDirPath, base: file })
                );
                this._loadFile(filePath);
            }
        } catch (e) {
            Logger.error(`Fail to load commands in ${commandDirPath} :`, e);
        }
    }

    /** Load all build-in commands */
    buildin(buildinCommandNames: "all"): void;
    /** Load build-in commands. */
    buildin(...buildinCommandNames: BuildInCommand[]): void;
    buildin(...buildinCommandNames: string[]) {
        if (buildinCommandNames.includes("all")) {
            this.loadCommands(__dirname + "/../commands");
        } else {
            for (const name of buildinCommandNames) {
                const filePath = path.resolve(
                    path.format({
                        dir: __dirname + "../commands",
                        name: name,
                        ext: ".cmd.js",
                    })
                );
                if (fs.existsSync(filePath)) this._loadFile(filePath);
            }
        }
    }

    /** Reload a command. */
    reload(command: Command) {
        if (!command.filepath) throw Error("Cannot reload sub command.");
        this._commands.delete(command);
        delete require.cache[command.filepath];
        this._loadFile(command.filepath);
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
    async parse(
        message: Message,
        options?: DeepPartial<ParseOptions>
    ): Promise<CommandResult> {
        // function OptionsError(paramName: string) {
        //     return new Error(
        //         `Invalid options value: "${paramName}" is invalid.`
        //     );
        // }

        async function Reply(content: string) {
            await message.reply(content).catch(Logger.error);
        }

        const opts = deepMerge(
            {},
            defaultOptions,
            this._defaultOptions,
            options
        );

        let content: string;
        const botMentionStr = `<@!${message.client.user?.id}>`;
        if (
            opts.allowMentionAsPrefix &&
            message.content.startsWith(botMentionStr)
        )
            content = message.content.substring(botMentionStr.length);
        else if (message.content.startsWith(opts.prefix))
            content = message.content.substring(opts.prefix.length);
        else return CommandResultUtils.notPrefixed();

        // extract the command & arguments from message
        const rawArgs = (
            content.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g) || []
        ).map((a) =>
            /^(".*"|'.*')$/.test(a) ? a.substring(1, a.length - 1) : a
        );

        const { command, args } = this.resolve(rawArgs);

        if (!command) return CommandResultUtils.commandNotFound();

        if (command.guildOnly && !message.guild) {
            await message.reply(
                template(opts.localization.misc.guildOnlyWarning, {
                    command: HelpUtils.Command.getFullName(command),
                })
            );
            return CommandResultUtils.guildOnly(command);
        }

        if (command.devOnly && !opts.devIDs.includes(message.author.id))
            return CommandResultUtils.devOnly(command);

        if (
            !opts.devIDs.includes(message.author.id) ||
            !opts.skipDevsPermissionsChecking
        ) {
            const result = command.canUse(message.author, message);
            if (typeof result === "string") await Reply(result);
            if (result !== true)
                return CommandResultUtils.unauthorizedUser(command);
        }

        if (message.member && !command.hasPermissions(message.member))
            return CommandResultUtils.unauthorizedUser(command);

        try {
            const result = await command.execute(message, args, opts, this);
            if (command.deleteMessage && message.channel.type === "text")
                await message.delete().catch(Logger.error);
            return CommandResultUtils.ok(command, result);
        } catch (e) {
            if (e instanceof CommandResultError) {
                if (e.replyMessage && e.replyMessage !== "")
                    await Reply(e.replyMessage);
                return e.commandResult;
            } else return CommandResultUtils.error(e);
        }
    }
}

/** @internal */
const defaultOptions: ParseOptions = {
    prefix: "",
    devIDs: [],
    localization: defaultLocalization,
    allowMentionAsPrefix: false,
    skipDevsPermissionsChecking: false,
};
