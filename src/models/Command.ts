import { Message, User, PermissionString, Guild, GuildMember } from "discord.js";
import { CommandSet } from "./CommandSet";
import { CommandSetOptions } from "./CommandSetOptions";
import { CommandData } from "./CommandData";
import { CommandDefinition } from "./definition/CommandDefinition";
import { ArgDef } from "./definition/ArgDefinition";
import { FlagDef } from "./definition/FlagDefinition";
import { Char } from "../utils/char";
import { CommandExecutor } from "./callbacks/CommandExecutor";
import { parseFlags } from "../other/parsing/parseFlags";
import { parseArgs } from "../other/parsing/parseArgs";
import { RestDefinition } from "./definition/RestDefinition";
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
        /** A [[RestDefinition]] if this command use the rest argument, `undefined` otherwise. */
        public readonly rest: Readonly<RestDefinition> | undefined,
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
            data.def.rest,
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

        const { flagValues, args } = parseFlags(message, inputArguments, this.flags, this._flagsShortcuts);
        const { argValues, rest } = parseArgs(message, args, this.args);

        if (throttler) throttler.increment(message);

        await this._executor(
            Object.fromEntries(argValues),
            Object.fromEntries(flagValues) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
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
}
