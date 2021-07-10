import { Message, User, PermissionString, Guild, GuildMember } from "discord.js";
import { CommandSet } from "./CommandSet";
import { CommandSetOptions } from "./CommandSetOptions";
import { CommandData } from "./CommandData";
import { CommandDefinition } from "./definition/CommandDefinition";
import { ArgDef } from "./definition/ArgDefinition";
import { FlagDef } from "./definition/FlagDefinition";
import { Char } from "../utils/char";
import { CommandExecutor } from "./callbacks/CommandExecutor";
import { CommandResultUtils } from "./CommandResult";
import { CommandResultError } from "./errors/CommandResultError";
import { ReadonlyCommandCollection, CommandCollection } from "./CommandCollection";
import { CanUseCommandHandler } from "./callbacks/CanUseCommandHandler";
import { HelpHandler } from "./callbacks/HelpHandler";
import { ThrottlingDefinition } from "./definition/ThrottlingDefinition";
import { CommandThrottler } from "./Throttler";
import { CommandLoadError } from "./errors/CommandLoadError";
import { defaultHelp } from "../other/HelpUtils";
import { CommandExample } from "./CommandExample";
import { isArray } from "../utils/array";
import { ParsingContext } from "./parsers/ParsingContext";
import { ParseError, UnhandledErrorParseError } from "./parsers";

export class Command {
    private readonly _throttler: CommandThrottler | null | undefined;
    /** Either or not this command's throttler also includes users with administrator permission. */
    public readonly throttlingIncludeAdmins: boolean;

    private constructor(
        /** Path to the file that contains the command if it's a top-most command, `null` otherwise. */
        public readonly filepath: string | null,
        /** Name of this command. */
        public readonly name: string,
        /** Aliases of this command. */
        public readonly aliases: readonly string[],
        /** The list of permissions the bot's user require to execute this command. */
        public readonly clientPermissions: readonly PermissionString[],
        /** The list of permissions the user require to execute this command. */
        public readonly userPermissions: readonly PermissionString[] | undefined,
        /** The list of exemples for this command. */
        public readonly examples: readonly Readonly<CommandExample>[],
        /** The description of the command. */
        public readonly description: string,
        /** This command's parent or `null` if it's a top-most command. */
        public readonly parent: Command | null,
        /** The [[CommandSet]] that contains this command. */
        public readonly commandSet: CommandSet,
        /** A [[ReadonlyCommandCollection]] of this command's sub-commands. */
        public readonly subs: ReadonlyCommandCollection,
        /** A `ReadonlyMap` with this command's arguments' [[ArgDefinition]] */
        public readonly args: ReadonlyMap<string, ArgDef>,
        /** A `ReadonlyMap` with this command's flags' [[FlagDefinition]] */
        public readonly flags: ReadonlyMap<string, FlagDef>,
        private readonly _flagsShortcuts: ReadonlyMap<Char, string>,
        private readonly _executor: CommandExecutor<any> | undefined, // eslint-disable-line @typescript-eslint/no-explicit-any
        private readonly _canUse: CanUseCommandHandler | undefined,
        private readonly _help: HelpHandler | undefined,
        throttling: ThrottlingDefinition | null | undefined,
        private readonly _useThrottlerOnSubs: boolean,
        /** Either or not this command is ignored. */
        public readonly ignored: boolean,
        /** Either or not this command can only be used by dev (see [[CommandSetOptions.devIDs]]). */
        public readonly devOnly: boolean,
        /** Either or not this command can only be used from a guild. */
        public readonly guildOnly: boolean,
        /** Either or not the message that executed this command is deleted after the command execution. */
        public readonly deleteMessage: boolean,
    ) {
        this._throttler = throttling
            ? new CommandThrottler(throttling.scope ?? "global", throttling.count, throttling.duration)
            : throttling;
        this.throttlingIncludeAdmins = throttling?.includeAdmins ?? false;
    }

    /** @internal */
    static load(filepath: string, commandSet: CommandSet): Command {
        const module = require(filepath); // eslint-disable-line @typescript-eslint/no-var-requires
        if (!module.default) throw new CommandLoadError("Command data must be exported as default.");
        return Command._build(filepath, commandSet, module.default, null, undefined);
    }

    private static _build<T extends CommandDefinition>(
        filepath: string | null,
        commandSet: CommandSet,
        data: CommandData<T>,
        parent: Command | null,
        parentHelp: HelpHandler | undefined,
    ): Command {
        function resolveInheritance<K extends keyof Command>(prop: K, defaultValue: Command[K]): Command[K] {
            return (data.def.inherit ?? true) && parent ? parent[prop] : defaultValue;
        }

        const subs = new CommandCollection();

        const examples: CommandExample[] = [];
        if (data.def.examples) {
            for (const e of data.def.examples) {
                if (typeof e === "string") examples.push({ example: e });
                else if (isArray(e)) examples.push({ example: e[0], description: e[1] });
                else examples.push({ example: e.example, description: e.description });
            }
        }

        const cmd = new Command(
            filepath,
            data.name,
            data.def.aliases ?? [],
            data.def.clientPermissions ?? [],
            data.def.userPermissions,
            examples,
            data.def.description ?? "",
            parent,
            commandSet,
            subs,
            new Map(data.def.args ? Object.entries(data.def.args) : []),
            new Map(data.def.flags ? Object.entries(data.def.flags) : []),
            new Map(
                data.def.flags
                    ? Object.entries(data.def.flags)
                          .filter(function (a): a is [string, FlagDef & { shortcut: Char }] {
                              return a[1].shortcut !== undefined;
                          })
                          .map(([k, v]) => [v.shortcut, k])
                    : [],
            ),
            data.executor,
            data.def.canUse,
            data.def.help ?? parentHelp,
            data.def.throttling,
            data.def.useThrottlerForSubs ?? true,
            data.def.ignore ?? resolveInheritance("ignored", false),
            data.def.devOnly ?? resolveInheritance("devOnly", false),
            data.def.guildOnly ?? resolveInheritance("guildOnly", false),
            data.def.deleteMessage ?? resolveInheritance("deleteMessage", false),
        );

        for (const subName in data.subs)
            subs.add(
                Command._build(
                    null,
                    commandSet,
                    data.subs[subName],
                    cmd,
                    (data.def.useHelpOnSubs ?? false) || (!data.def.help && !!parentHelp) ? cmd._help : undefined,
                ),
            );
        return cmd;
    }

    // === Getter =====================================================

    /**
     * The [[CommandThrottler]] used by this command.
     */
    get throttler(): CommandThrottler | undefined {
        if (this._throttler === null) return undefined;
        if (this._throttler) return this._throttler;
        if (this.parent && this.parent._useThrottlerOnSubs) return this.parent.throttler;
        return undefined;
    }

    /**
     * Either or not this command has an executor.
     */
    get hasExecutor(): boolean {
        return this._executor !== undefined;
    }

    /**
     * Returns an array containing all parents of this command, ordered from top-most command to this command (included).
     * @returns An array of this command's parent [[Command]].
     */
    getParents(): Command[] {
        const parents: Command[] = [];
        parents.unshift(this);

        for (let parent = this.parent; parent; parent = parent.parent) parents.unshift(parent);

        return parents;
    }

    /**
     * Determines if the bot's user have required permissions to execute this command from the guild.
     * @param guild The guild from which check permissions.
     * @returns Either or not the bot's user have required permissions to execute this command from the guild.
     */
    hasClientPermissions(guild: Guild): boolean {
        return guild.me ? guild.me.hasPermission(this.clientPermissions) : false;
    }

    /**
     * Determines if a member have required permissions to execute this command.
     * @param member
     * @returns Either or not the member have required permissions to execute this command.
     */
    hasPermissions(member: GuildMember): boolean {
        if (!this.userPermissions) {
            if (this.parent) return this.parent.hasPermissions(member);
            else return true;
        }
        return member.hasPermission(this.userPermissions);
    }

    // =====================================================

    /**
     * Call the `canUse` handler of this command and its parents (see [[CommandDefinition.canUse]])
     * and return the first negative result (`false` or a `string`) or `true`.
     * @param user
     * @param message
     * @returns Result of `canUse` handlers.
     */
    canUse(user: User, message: Message): boolean | string {
        if (this.parent) {
            const res = this.parent.canUse(user, message);
            if (res !== true) return res;
        }
        if (this._canUse) return this._canUse(user, message);
        return true;
    }

    /**
     * Determines of the message author pass the [[canUse]] and the [[hasPermissions]] checks.
     * @param message
     * @returns Either or not the message author pass the [[canUse]] and the [[hasPermissions]] checks.
     */
    checkPermissions(message: Message): boolean {
        return (
            this.canUse(message.author, message) === true && (!message.member || this.hasPermissions(message.member))
        );
    }

    /**
     * Call the suitable help handler for this command.
     * @param message
     * @param options
     */
    async help(message: Message, options: CommandSetOptions): Promise<void> {
        const context = {
            message,
            options,
            commandSet: this.commandSet,
        };

        if (this._help) {
            await this._help(this, context);
        } else if (this.commandSet.helpHandler) {
            await this.commandSet.helpHandler(this, context);
        } else {
            await defaultHelp(this, context);
        }
    }

    /** @internal */
    async execute(message: Message, inputArguments: string[], options: CommandSetOptions, commandSet: CommandSet) {
        if (message.guild && !this.hasClientPermissions(message.guild))
            throw new CommandResultError(CommandResultUtils.clientPermissions(this));

        /** This command throttler if is required and defined, undefined otherwise. */
        const throttler =
            !options.devIDs.includes(message.author.id) &&
            !(!this.throttlingIncludeAdmins && message.member && message.member.permissions.has("ADMINISTRATOR"))
                ? this.throttler
                : undefined;

        if (throttler && throttler.getThrottled(message))
            throw new CommandResultError(CommandResultUtils.throttling(this));

        if (!this._executor) throw new CommandResultError(CommandResultUtils.noExecutor(this));

        const { flags, args, rest } = this.parse(message, inputArguments, options);

        if (throttler) throttler.increment(message);

        await this._executor(
            Object.fromEntries(args),
            Object.fromEntries(flags) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            {
                rest,
                message,
                guild: message.guild,
                member: message.member,
                channel: message.channel,
                options,
                commandSet,
                command: this,
            },
        );
    }

    /** @internal */
    private parse(
        message: Message,
        inputArguments: readonly string[],
        options: CommandSetOptions,
    ): { flags: Map<string, unknown>; args: Map<string, unknown>; rest: string[] } {
        const flags = new Map<string, unknown>(
            Array.from(this.flags.entries()).map(([k, v]) => [k, v.parser === undefined ? false : v.defaultValue]),
        );
        const args = new Map<string, unknown>();
        const rest = [...inputArguments];
        const absolutePositions = [...Array(inputArguments.length).keys()];

        const flagDatas: { name: string; def: FlagDef; position: number }[] = [];

        const getFlagDefFromShort = (shortcut: Char, position: number): { name: string; def: FlagDef } | null => {
            const name = this._flagsShortcuts.get(shortcut);

            // if the flag is unknown
            if (!name) {
                if (options.ignoreUnknownFlags) return null;
                throw new CommandResultError(CommandResultUtils.unknownFlag(inputArguments, position, shortcut));
            }

            const def = getFlagDefFromLong(name, position);
            return def ? { name, def } : null;
        };

        const getFlagDefFromLong = (name: string, position: number): FlagDef | null => {
            const def = this.flags.get(name);

            // if the flag is unknown
            if (!def) {
                if (options.ignoreUnknownFlags) return null;
                throw new CommandResultError(CommandResultUtils.unknownFlag(inputArguments, position, name));
            }

            return def;
        };

        for (let i = 0; i < inputArguments.length; i++) {
            const a = inputArguments[i];
            if (a.startsWith("-")) {
                if (a.startsWith("--")) {
                    const name = a.substr(2);
                    const def = getFlagDefFromLong(name, i);

                    // check if the flag has not been ignored.
                    if (def !== null) {
                        flagDatas.push({ name, def, position: i });
                    }
                } else {
                    const shortNames = a.substring(1).split("") as Char[];
                    const lastShort = shortNames.pop() as Char;
                    shortNames.forEach(sn => {
                        const name_def = getFlagDefFromShort(sn, i);
                        if (!name_def) return; // the flag is ignored.
                        const { name, def } = name_def;
                        if (def.parser)
                            throw new CommandResultError(CommandResultUtils.wrongFlagUsage(inputArguments, i, sn, def));
                        flags.set(name, true);
                    });
                    const name_def = getFlagDefFromShort(lastShort, i);
                    // check if the flag has not been ignored.
                    if (name_def !== null) {
                        flagDatas.push({ ...name_def, position: i });
                    }
                }
            }
        }

        for (let i = 0; i < flagDatas.length; i++) {
            const cur = flagDatas[i];
            const next = flagDatas[i + 1];
            const context = new ParsingContext(message, inputArguments, cur.position, next?.position);

            let value: unknown;
            if (cur.def.parser) {
                try {
                    value = cur.def.parser._parse(context);
                } catch (e) {
                    const error = e instanceof ParseError ? e : new UnhandledErrorParseError(e);
                    throw new CommandResultError(CommandResultUtils.parseError(inputArguments, cur.position, error));
                }
            } else {
                value = true;
            }

            flags.set(cur.name, value);
            rest.splice(cur.position, 1 + context.consumed);
            absolutePositions.splice(cur.position, 1 + context.consumed);
        }

        const context = new ParsingContext(message, rest);
        let current: number;
        for (const [name, def] of this.args) {
            let value: unknown;
            current = context.consumed;

            if (context.remaining === 0 && def.optional) {
                value = def.defaultValue;
            } else {
                try {
                    value = def.parser._parse(context);
                } catch (e) {
                    const position = absolutePositions[current];
                    const error = e instanceof ParseError ? e : new UnhandledErrorParseError(e);
                    throw new CommandResultError(CommandResultUtils.parseError(inputArguments, position, error));
                }
            }

            args.set(name, value);
        }

        return { flags, args, rest: context.rest() };
    }

    // /** @internal */
    // private parseFlags(
    //     message: Message,
    //     inputArguments: readonly string[],
    // ): { flagValues: Map<string, unknown>; args: string[] } {
    //     const args = [...inputArguments];
    //     const flagValues = new Map<string, unknown>(
    //         Array.from(this.flags.entries()).map(([k, v]) => [k, v.parser === undefined ? false : v.defaultValue]),
    //     );

    //     const flagPreParse: { name: string; def: FlagDef; position: number }[] = [];

    //     const getFlagName = (shortcut: Char): string => {
    //         const name = this._flagsShortcuts.get(shortcut);
    //         if (name) return name;
    //         // TODO: raise error ?
    //         Logger.debug("TODO: unknow shortcut:", shortcut);
    //         throw new CommandResultError(CommandResultUtils.unknownFlag(shortcut));
    //     };

    //     const getFlagDef = (name: string): FlagDef => {
    //         const def = this.flags.get(name);
    //         if (def) return def;
    //         // TODO: raise error ?
    //         Logger.debug("TODO: unknow flag :", name);
    //         throw new CommandResultError(CommandResultUtils.unknownFlag(name));
    //     };

    //     for (let i = 0; i < args.length; i++) {
    //         const a = args[i];

    //         if (a.startsWith("-")) {
    //             let name: string;
    //             if (a.startsWith("--")) {
    //                 name = a.substr(2);
    //             } else {
    //                 const shortNames = a.substring(1).split("") as Char[];
    //                 const lastShort = shortNames.pop() as Char;

    //                 shortNames.forEach(sn => {
    //                     const def = getFlagDef(getFlagName(sn));

    //                     if (def.parser) {
    //                         // TODO: raise error ?
    //                         Logger.debug("TODO: invalid flag value:", name);
    //                         throw new CommandResultError(CommandResultUtils.wrongFlagUsage(sn, def));
    //                     }

    //                     flagValues.set(name, true);
    //                 });

    //                 name = getFlagName(lastShort);
    //             }

    //             const def = getFlagDef(name);

    //             flagPreParse.push({ name, def, position: i });
    //         }
    //     }

    //     for (let i = 0; i < flagPreParse.length; i++) {
    //         const cur = flagPreParse[i];
    //         const next = i < flagPreParse.length - 1 ? flagPreParse[i + 1] : undefined;

    //         const context = new ParsingContext(message, inputArguments, cur.position, next?.position);

    //         let value;
    //         try {
    //             value = cur.def.parser ? cur.def.parser._parse(context) : true;
    //         } catch (e) {
    //             if (e instanceof ParseError) {
    //                 // TODO
    //                 Logger.debug("TODO: catch parse error:", e);
    //                 throw e;
    //             } else {
    //                 // TODO
    //                 Logger.debug("TODO: catch error while parsing:", e);
    //                 throw e;
    //             }
    //         }

    //         flagValues.set(cur.name, value);
    //         args.splice(cur.position, 1 + context.consumed);
    //     }

    //     return { flagValues, args };
    // }

    // /** @internal */
    // private parseArgs(
    //     message: Message,
    //     inputArguments: readonly string[],
    // ): { argValues: Map<string, unknown>; rest: string[] } {
    //     const context = new ParsingContext(message, inputArguments);
    //     const values = new Map<string, unknown>();

    //     for (const [name, def] of this.args) {
    //         let value: unknown;
    //         if (context.remaining === 0) {
    //             if (!def.optional) throw new Error("missing arg"); // TODO //throw new CommandResultError(CommandResultUtils.failParseArgMissing(def));
    //             value = def.defaultValue;
    //         } else {
    //             try {
    //                 value = def.parser._parse(context);
    //             } catch (e) {
    //                 if (e instanceof ParseError) {
    //                     // TODO
    //                     Logger.debug("TODO: catch parse error:", e);
    //                     throw e;
    //                 } else {
    //                     // TODO
    //                     Logger.debug("TODO: catch error while parsing:", e);
    //                     throw e;
    //                 }
    //             }
    //         }
    //         values.set(name, value);
    //     }

    //     return { argValues: values, rest: context.rest() };
    // }
}
