import fs from "fs";
import path from "path";

import { DiscordAPIError, Message } from "discord.js";

import { Command } from "./Command";
import * as com from "./com";
import * as CommandResult from "./CommandResult";

export interface ParseOption {
    prefix?: string;
    helpOnSignatureNotFound: boolean;
    deleteMessageIfCommandNotFound: boolean;
    devIDs: string[];
}

export class CommandSet {

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

    loadCommands(commandDirPath: string) {
        try {
            const cmdFiles = fs.readdirSync(commandDirPath).filter(file => file.endsWith('.cmd.js'));
            for (const file of cmdFiles) {
                const filePath = path.resolve(path.format({ dir: commandDirPath, base: file }));
                this._loadFile(filePath);
            }
        } catch (e) {
            com.error(`Fail to load commands in ${commandDirPath} :`, e);
        }
    }

    buildin(...buildinCommandNames: string[]) {
        for (const name of buildinCommandNames) {
            const filePath = path.resolve(path.format({ dir: __dirname + '/cmds', name: name, ext: '.cmd.js' }));
            if (fs.existsSync(filePath))
                this._loadFile(filePath);
        }
    }

    get(commandName: string) {
        return this._commands.get(commandName);
    }

    resolve(args: string[]) {
        if (!Array.isArray(args))
            return { args: args };

        args = [...args]; // make a copy of args
        let cmd = this._commands.get(args[0]);

        if (cmd) {
            let sub : Command | undefined = cmd;
            do {
                cmd = sub;
                args.shift();
                sub = cmd.getSubCommand(args[0]);
            } while (sub);

            return { cmd: cmd, args: args };
        } else {
            return { args: args };
        }
    }

    commands() {
        return this._commands.values();
    }

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

    async parse(msg: Message, context: any, options: ParseOption) /*: Promise<CommandResult.CommandResult>*/ {
        let o: ParseOption = {
            prefix: undefined,
            helpOnSignatureNotFound: true,
            deleteMessageIfCommandNotFound: true,
            devIDs: [],
        };

        // Merge default options & user options
        Object.assign(o, options);

        // Sanitize options
        if (o.prefix == undefined) o.prefix = "";
        if (!Array.isArray(o.devIDs)) o.devIDs = [];

        // Extract command & arguments from message
        if (!msg.content.startsWith(o.prefix)) return CommandResult.notPrefixed();

        // extract the command & arguments from message
        const inArgs = msg.content.slice(o.prefix.length).split(/ +/);
        const { cmd, args } = this.resolve(inArgs);

        try {
            if (!cmd) {
                if (o.deleteMessageIfCommandNotFound && msg.channel.type === 'text') await msg.delete();
                return CommandResult.commandNotFound();
            }

            if (cmd.deleteCommand && msg.channel.type === 'text') await msg.delete();

            if (cmd.isDevOnly && !(msg.author.id in o.devIDs)) return CommandResult.devOnly();

            return await cmd.execute(msg, args, context, JSON.parse(JSON.stringify(o)), this);
        } catch (e) {
            return CommandResult.error(e);
        }
    }
}