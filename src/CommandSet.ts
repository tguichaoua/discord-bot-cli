import fs from "fs";
import path from "path";

import { Message } from "discord.js";

import Command from "./Command";
import * as com from "./com";
import * as CommandResult from "./CommandResult";

export default class CommandSet {

    private _commands = new Map<string, Command>();

    constructor() { }

    /** @ignore */
    private _loadFile(path: string) {
        try {
            const cmd = require(path);
            if (!(cmd instanceof Command)) return;
            if (cmd.ignored) return;
            if (cmd.signatures.length === 0 && cmd.subs.length === 0) {
                com.log(`The command at ${path} have been ignored because have no signature and no sub command.`);
                return;
            }
            this._commands.set(cmd.name, cmd);
        } catch (e) {
            com.error(`Fail to load command at ${path} :`, e);
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
            com.error(`Fail to load commands in ${commandDirPath} :`, e);
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
            this.loadCommands(__dirname + "/dist/commands");
        } else {
            for (const name of buildinCommandNames) {
                const filePath = path.resolve(path.format({ dir: __dirname + '/dist/commands', name: name, ext: '.cmd.js' }));
                if (fs.existsSync(filePath))
                    this._loadFile(filePath);
            }
        }
    }

    get(commandName: string) {
        return this._commands.get(commandName);
    }

    resolve(args: string[]) {
        if (!Array.isArray(args))
            return { args };

        args = [...args]; // make a copy of args
        let cmd = this._commands.get(args[0]);

        if (cmd) {
            let sub: Command | undefined = cmd;
            do {
                cmd = sub;
                args.shift();
                sub = cmd.getSubCommand(args[0]);
            } while (sub);

            return { command: cmd, args };
        } else {
            return { args };
        }
    }

    commands() {
        return this._commands.values();
    }

    /**
     * Init all commands.
     * @param context - a context object that is send to command when executed. (can store database or other data)
     */
    async init(context: any) {
        for (const cmd of this._commands.values()) {
            if (cmd.isInitialized) continue;
            try {
                await cmd.init(context, this);
            } catch (e) {
                com.error('fail to init the following command\n', cmd, '\ncause :', e);
            }
        }
    }

    /**
     * Check if there is a command in the given message and execute it.
     * @param msg
     * @param context - a context object that is send to command when executed. (can store database or other data)
     * @param options - option de define the behaviour of the command parser.
     */
    async parse(msg: Message, context: any, options: ParseOption) {

        // make a deep copy of options
        options = JSON.parse(JSON.stringify(options));

        // Extract command & arguments from message
        if (!msg.content.startsWith(options.prefix)) return CommandResult.notPrefixed();

        // extract the command & arguments from message
        const inArgs = msg.content.slice(options.prefix.length).split(/ +/);
        const { command, args } = this.resolve(inArgs);

        try {
            if (!command) {
                if (options.deleteMessageIfCommandNotFound && msg.channel.type === 'text') await msg.delete();
                return CommandResult.commandNotFound();
            }

            if (command.deleteCommand && msg.channel.type === 'text') await msg.delete();

            if (command.isDevOnly && !(msg.author.id in options.devIDs)) return CommandResult.devOnly();

            return await command.execute(msg, args, context, options, this);
        } catch (e) {
            return CommandResult.error(e);
        }
    }

    static createParseOption(
        prefix?: string,
        helpOnSignatureNotFound = true,
        deleteMessageIfCommandNotFound = true,
        devIDs: string[] = []
    ): ParseOption {
        return {
            prefix: prefix ?? "",
            helpOnSignatureNotFound,
            deleteMessageIfCommandNotFound,
            devIDs: devIDs ?? []
        }
    }
}

export interface ParseOption {
    prefix: string;
    helpOnSignatureNotFound: boolean;
    deleteMessageIfCommandNotFound: boolean;
    devIDs: string[];
}