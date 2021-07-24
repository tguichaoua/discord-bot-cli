import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Message } from "discord.js";
import { Analyser, ArgItem } from "arg-analyser";

import { Logger } from "../logger";
import { relativeFromEntryPoint, resolveFromEntryPoint } from "../utils/PathUtils";

import { CommandLoadError, CommandResultError } from "./errors";

import { Command } from "./Command";
import { CommandResultUtils, CommandResult } from "./CommandResult";
import { CommandManagerOptions } from "./CommandManagerOptions";
import { CommandCollection, ReadonlyCommandCollection } from "./CommandCollection";
import { HelpHandler } from "./HelpHandler";

type BuildInCommand = "help" | "list" | "cmd";

export class CommandManager {
    private _commands = new CommandCollection();
    /** If defined, called when [[Command.help]] is called and if the command didn't define its own help handler. */
    public helpHandler: HelpHandler | undefined = undefined;

    private readonly analyser: Analyser;

    constructor(private _defaultOptions?: Partial<CommandManagerOptions>) {
        this.analyser = new Analyser({
            groupDelimiters: [
                ["(", ")"],
                ["[", "]"],
                ["{", "}"],
            ],
        });
    }

    /** A readonly collection of commands. */
    get commands() {
        return this._commands as ReadonlyCommandCollection;
    }

    private _loadFile(path: string) {
        const debugPath = chalk.underline(relativeFromEntryPoint(path));
        Logger.debug(`Load command from ${debugPath}`);
        try {
            const command = Command.load(path, this);
            if (command.ignored) Logger.info(`Command ignored ${debugPath}`);
            else {
                if (!this._commands.add(command))
                    Logger.warn(`Command not loaded, the name is already taken. (${debugPath})`);
            }
        } catch (e) {
            let error;
            if (e instanceof CommandLoadError) error = e.message;
            else error = e;
            Logger.error(`Fail to load command from ${debugPath}\n${chalk.red("Error:")}`, error);
        }
    }

    /**
     * Loads commands from the given folder path.
     * Command files must have the extension `.cmd.js`.
     * @param commandDirPath - The path to the folder where the commands are (relative to node entry point).
     * @param includeTS - If set to `true`, files with `.cmd.ts` extension are also loaded. Usefull if you use `ts-node` (default is `false`)
     */
    loadCommands(commandDirPath: string, includeTS = false): void {
        try {
            commandDirPath = resolveFromEntryPoint(commandDirPath);
            const cmdFiles = fs
                .readdirSync(commandDirPath)
                .filter(file => file.endsWith(".cmd.js") || (includeTS && file.endsWith(".cmd.ts")));
            for (const file of cmdFiles) {
                const filePath = path.resolve(path.format({ dir: commandDirPath, base: file }));
                this._loadFile(filePath);
            }
        } catch (e) {
            Logger.error(`Fail to load commands in ${commandDirPath} :`, e);
        }
    }

    /** Loads all build-in commands */
    buildin(buildinCommandNames: "all"): void;
    /**
     * Loads build-in commands.
     * @param buildinCommandNames A list of build-in commands.
     */
    buildin(...buildinCommandNames: BuildInCommand[]): void;
    buildin(...buildinCommandNames: string[]): void {
        if (buildinCommandNames.includes("all")) {
            this.loadCommands(__dirname + "/../../commands");
        } else {
            for (const name of buildinCommandNames) {
                const filePath = path.resolve(
                    path.format({
                        dir: __dirname + "/../../commands",
                        name: name,
                        ext: ".cmd.js",
                    }),
                );
                if (fs.existsSync(filePath)) this._loadFile(filePath);
            }
        }
    }

    /**
     * Reloads a command.
     * @param command - The command to reload.
     */
    reload(command: Command): void {
        if (!command.filepath) throw Error("Cannot reload sub command.");
        this._commands.delete(command);
        delete require.cache[command.filepath];
        this._loadFile(command.filepath);
    }

    /** @internal */
    resolve(args: readonly string[]): { command: Command | null; consumed: number } {
        let command = args[0] ? this._commands.get(args[0]) : undefined;

        if (!command) return { command: null, consumed: 0 };

        for (let i = 1; i < args.length; ++i) {
            const sub: Command | undefined = command.subs.get(args[i]!);
            if (!sub) return { command, consumed: i };
            command = sub;
        }

        return { command, consumed: args.length };
    }

    /**
     * Parses the message's content and executes the command.
     * @param message - The message to parse.
     * @param options - Options to define the parsing behaviour.
     * @returns The result of the parsing.
     */
    async parse(message: Message, options?: Partial<CommandManagerOptions>): Promise<CommandResult> {
        async function Reply(content: string) {
            await message.reply(content).catch(Logger.error);
        }

        const opts = Object.assign({}, defaultOptions, this._defaultOptions, options);

        let content: string;
        const botMentionStr = `<@!${message.client.user?.id}>`;
        if (opts.allowMentionAsPrefix && message.content.startsWith(botMentionStr))
            content = message.content.substring(botMentionStr.length);
        else if (message.content.startsWith(opts.prefix)) content = message.content.substring(opts.prefix.length);
        else return CommandResultUtils.notPrefixed();

        Logger.debug("content = ", content);

        const args = this.analyser.analyse(content);

        Logger.debug("args = ", args);

        const isSimpleStringArg = (a: ArgItem): a is ArgItem & { kind: "string"; delimiter: "" } =>
            a.kind === "string" && a.delimiter === "";

        const commandName =
            args.length === 1
                ? isSimpleStringArg(args[0]!)
                    ? [args[0].content]
                    : []
                : (
                      args.slice(
                          0,
                          args.findIndex(a => !isSimpleStringArg(a)),
                      ) as (ArgItem & { kind: "string" })[]
                  ).map(a => a.content);

        const { command, consumed } = this.resolve(commandName);

        if (!command) return CommandResultUtils.commandNotFound();

        if (command.guildOnly && !message.guild) return CommandResultUtils.guildOnly(command);

        if (command.ownerOnly && !opts.ownerIDs.includes(message.author.id))
            return CommandResultUtils.ownerOnly(command);

        if (!opts.ownerIDs.includes(message.author.id) || !opts.skipOwnerPermissionsChecking) {
            const result = command.canUse(message.author, message);
            if (typeof result === "string") await Reply(result);
            if (result !== true) return CommandResultUtils.unauthorizedUser(command);
        }

        if (message.member && !command.hasPermissions(message.member))
            return CommandResultUtils.unauthorizedUser(command);

        args.splice(0, consumed); // Remove consumed argument by the resolve process.
        try {
            await command.execute(message, args, opts, this);
            if (command.deleteMessage && message.channel.type === "text") await message.delete().catch(Logger.error);
            return CommandResultUtils.ok(command);
        } catch (e) {
            if (e instanceof CommandResultError) {
                if (e.replyMessage && e.replyMessage !== "") await Reply(e.replyMessage);
                return e.commandResult;
            } else return CommandResultUtils.error(e);
        }
    }
}

/** @internal */
const defaultOptions: CommandManagerOptions = {
    prefix: "",
    ownerIDs: [],
    allowMentionAsPrefix: false,
    skipOwnerPermissionsChecking: false,
    ignoreUnknownFlags: false,
    localizationResolver: undefined,
};
