import { Message, User, PermissionString, Guild, GuildMember } from "discord.js";
import { ArgItem } from "arg-analyser";

import { Char } from "../utils/Char";
import { toKebabCase } from "../utils/case";
import { isArray } from "../utils/array";
import { map } from "../utils/object";

import { ParseError, UnhandledErrorParseError } from "../parser";
import { defaultHelpHandler } from "../humanize/help";
import { Localizator } from "../localization";

import { ThrottlingDefinition, CommandDefinition, ArgDefinition } from "./definitions";
import { CommandLoadError, CommandResultError } from "./errors";

import { CommandSet } from "./CommandSet";
import { CommandSetOptions } from "./CommandSetOptions";
import { CommandData } from "./CommandData";
import { CommandExecutor } from "./CommandExecutor";
import { CommandResultUtils } from "./CommandResult";
import { ReadonlyCommandCollection, CommandCollection } from "./CommandCollection";
import { CanUseCommandHandler } from "./CanUseCommandHandler";
import { HelpHandler } from "./HelpHandler";
import { CommandThrottler } from "./Throttler";
import { CommandExample } from "./CommandExample";
import { ParsingContext } from "../parser/ParsingContext";
import { FlagData } from "./FlagData";

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
        public readonly args: ReadonlyMap<string, ArgDefinition>,
        /** A `ReadonlyArray` with this command's flags' [[FlagData]] */
        public readonly flags: ReadonlyArray<FlagData>,
        private readonly flagLong: ReadonlyMap<string, FlagData>,
        private readonly flagShort: ReadonlyMap<Char, FlagData>,
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

        const makeLoadError = (msg: string) => {
            const cmdPath = parent
                ? parent
                      .getParents()
                      .map(c => c.name)
                      .join(".") +
                  "." +
                  data.name
                : data.name;
            return new CommandLoadError(`At command \`${cmdPath}\` : ${msg}`);
        };

        const subs = new CommandCollection();

        //___ Parse examples ______________________________________________________________________
        const examples: CommandExample[] = [];
        if (data.def.examples) {
            for (const e of data.def.examples) {
                if (typeof e === "string") examples.push({ example: e });
                else if (isArray(e)) examples.push({ example: e[0], description: e[1] });
                else examples.push({ example: e.example, description: e.description });
            }
        }

        //___ Parse the flags _____________________________________________________________________
        const flags: FlagData[] = [];
        const flagLong = new Map<string, FlagData>();
        const flagShort = new Map<Char, FlagData>();

        if (data.def.flags) {
            Object.entries(data.def.flags).forEach(([key, def]) => {
                let long: string | undefined;
                if (typeof def.long === "string") {
                    long = toKebabCase(def.long);
                } else if (typeof def.long === "undefined") {
                    long = toKebabCase(key);
                } else {
                    long = undefined;
                }

                let short: Char | undefined;
                if (typeof def.short === "string") {
                    short = def.short;
                } else if (typeof def.short === "undefined") {
                    short = long ? (long[0] as Char) : (key[0] as Char);
                } else {
                    short = undefined;
                }

                if (!long && !short) throw makeLoadError(`flag \`${key}\` has neither long nor short name.`);

                const data: FlagData = {
                    key,
                    parser: def.parser,
                    description: def.description,
                    defaultValue: def.defaultValue,
                    long,
                    short,
                };

                if (long) {
                    const conflict = flagLong.get(long);
                    if (conflict)
                        throw makeLoadError(
                            `flags \`${conflict.key}\` and \`${key}\` has the same long name \`${long}\``,
                        );
                    flagLong.set(long, data);
                }
                if (short) {
                    const conflict = flagShort.get(short);
                    if (conflict)
                        throw makeLoadError(
                            `flags \`${conflict.key}\` and \`${key}\` has the same short name \`${short}\``,
                        );
                    flagShort.set(short, data);
                }
                flags.push(data);
            });
        }

        //___ Create the Command object ___________________________________________________________
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
            flags,
            flagLong,
            flagShort,
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
            localizator: Localizator.create(options.localizationResolver, message),
        };

        if (this._help) {
            await this._help(this, context);
        } else if (this.commandSet.helpHandler) {
            await this.commandSet.helpHandler(this, context);
        } else {
            await defaultHelpHandler(this, context);
        }
    }

    /** @internal */
    async execute(
        message: Message,
        inputArguments: readonly ArgItem[],
        options: CommandSetOptions,
        commandSet: CommandSet,
    ) {
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
        inputArguments: readonly ArgItem[],
        options: CommandSetOptions,
    ): { flags: Map<string, unknown>; args: Map<string, unknown>; rest: ArgItem[] } {
        const flags = new Map<string, unknown>(
            this.flags.map(f => [f.key, f.parser === undefined ? 0 : f.defaultValue]),
        );
        // const args = new Map<string, unknown>();
        const rest = [...inputArguments];
        const absolutePositions = [...Array(inputArguments.length).keys()];

        const flagDatas: { data: FlagData; position: number }[] = [];

        //* Must only be called if the flag has no parser. */
        const incrementFlag = (key: string) => {
            // Since incrementFlag is called only when the flag has no parser,
            // the value is necessary an integer.
            const value = flags.get(key) as number;
            flags.set(key, value + 1);
        };

        const getFlagDataFromShort = (short: Char, position: number): FlagData | null => {
            const data = this.flagShort.get(short);
            if (data) return data;
            if (options.ignoreUnknownFlags) return null;
            throw new CommandResultError(CommandResultUtils.unknownFlag(inputArguments, position, short));
        };

        const getFlagDataFromLong = (long: string, position: number): FlagData | null => {
            const data = this.flagLong.get(long);
            if (data) return data;
            if (options.ignoreUnknownFlags) return null;
            throw new CommandResultError(CommandResultUtils.unknownFlag(inputArguments, position, long));
        };

        inputArguments
            // Only arguments of type string and that is not between quotes can be flags.
            .filter((a): a is ArgItem & { kind: "string" } => a.kind === "string" && a.delimiter === "")
            .forEach((a, i) => {
                if (a.content.startsWith("-")) {
                    if (a.content.startsWith("--")) {
                        const long = a.content.substr(2);
                        const data = getFlagDataFromLong(long, i);

                        // check if the flag has not been ignored.
                        if (data !== null) flagDatas.push({ data, position: i });
                    } else {
                        const shortNames = a.content.substring(1).split("") as Char[];
                        const lastShort = shortNames.pop() as Char;
                        shortNames.forEach(sn => {
                            const data = getFlagDataFromShort(sn, i);
                            if (data === null) return;
                            // A flag with a parser cannot be used in middle of multiple short flags.
                            if (data.parser)
                                throw new CommandResultError(
                                    CommandResultUtils.wrongFlagUsage(inputArguments, i, sn, data),
                                );
                            incrementFlag(data.key);
                        });

                        const data = getFlagDataFromShort(lastShort, i);
                        if (data !== null) flagDatas.push({ data, position: i });
                    }
                }
            });

        flagDatas.forEach((cur, i) => {
            const next = flagDatas[i + 1];
            const context = new ParsingContext(message, inputArguments, cur.position, next?.position);

            if (cur.data.parser) {
                try {
                    const value = cur.data.parser.parse(context);
                    flags.set(cur.data.key, value);
                } catch (e) {
                    const error = e instanceof ParseError ? e : new UnhandledErrorParseError(e);
                    throw new CommandResultError(CommandResultUtils.parseError(inputArguments, cur.position, error));
                }
            } else {
                incrementFlag(cur.data.key);
            }

            rest.splice(cur.position, 1 + context.consumed);
            absolutePositions.splice(cur.position, 1 + context.consumed);
        });

        const context = new ParsingContext(message, rest);

        const args = map(this.args, def => {
            if (context.remaining === 0 && def.optional) {
                return def.defaultValue;
            }

            const current = context.consumed;
            try {
                return def.parser.parse(context);
            } catch (e) {
                const position = absolutePositions[current];
                if (!position) throw Error("Shouldn't happen !");
                const error = e instanceof ParseError ? e : new UnhandledErrorParseError(e);
                throw new CommandResultError(CommandResultUtils.parseError(inputArguments, position, error));
            }
        });

        return { flags, args, rest: context.rest() };
    }
}
