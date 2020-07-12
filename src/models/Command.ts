import {
    Message,
    User,
    PermissionString,
    Guild,
    GuildMember,
} from "discord.js";
import { CommandSet } from "./CommandSet";
import { ParseOptions } from "./ParseOptions";
import { CommandData } from "./CommandData";
import { CommandDefinition } from "./definition/CommandDefinition";
import { ArgDefinition } from "./definition/ArgDefinition";
import { FlagDefinition } from "./definition/FlagDefinition";
import { Char } from "../utils/char";
import { CommandExecutor } from "./callbacks/CommandExecutor";
import { parseFlags } from "../other/parsing/parseFlags";
import { parseArgs } from "../other/parsing/parseArgs";
import { RestDefinition } from "./definition/RestDefinition";
import { CommandResultUtils } from "./CommandResult";
import { CommandResultError } from "./CommandResultError";
import {
    ReadonlyCommandCollection,
    CommandCollection,
} from "./CommandCollection";
import { CanUseCommandCb } from "./callbacks/CanUseCommandCb";
import { HelpCb } from "./callbacks/HelpCb";
import { parseValue } from "../other/parsing/parseValue";
import { ParsableType } from "./ParsableType";
import { ThrottlingDefinition } from "./definition/ThrottlingDefinition";
import { Throttler } from "./Throttler";

export class Command {
    private readonly _throttler: Throttler | null | undefined;
    public readonly _throttlingIncludeAdmins: boolean;

    private constructor(
        public readonly filepath: string | null,
        public readonly name: string,
        public readonly aliases: readonly string[],
        private readonly _clientPermissions: PermissionString[],
        private readonly _userPermissions: PermissionString[] | undefined,
        public readonly examples: readonly string[],
        public readonly description: string,
        public readonly parent: Command | null,
        public readonly commandSet: CommandSet,
        public readonly subs: ReadonlyCommandCollection,
        public readonly args: ReadonlyMap<string, ArgDefinition>,
        public readonly rest: Readonly<RestDefinition> | undefined,
        public readonly flags: ReadonlyMap<string, FlagDefinition>,
        private readonly _flagsShortcuts: ReadonlyMap<Char, string>,
        private readonly _executor: CommandExecutor<any> | undefined,
        private readonly _canUse: CanUseCommandCb | undefined,
        private readonly _help: HelpCb | undefined,
        throttling: ThrottlingDefinition | null | undefined,
        private readonly _useThrottlerOnSubs: boolean,
        public readonly ignored: boolean,
        public readonly devOnly: boolean,
        public readonly guildOnly: boolean,
        public readonly deleteMessage: boolean
    ) {
        this._throttler = throttling
            ? new Throttler(throttling.count, throttling.duration)
            : throttling;
        this._throttlingIncludeAdmins = throttling?.includeAdmins ?? false;
    }

    /** @internal */
    static load(filepath: string, commandSet: CommandSet): Command {
        const module = require(filepath); // eslint-disable-line @typescript-eslint/no-var-requires
        if (!module.default)
            throw new Error("Command data must be exported as default.");
        return Command._build(
            filepath,
            commandSet,
            module.default,
            null,
            undefined
        );
    }

    private static _build<T extends CommandDefinition>(
        filepath: string | null,
        commandSet: CommandSet,
        data: CommandData<T>,
        parent: Command | null,
        parentHelp: HelpCb | undefined
    ): Command {
        function resolveInheritance<K extends keyof Command>(
            prop: K,
            defaultValue: Command[K]
        ): Command[K] {
            return (data.def.inherit ?? true) && parent
                ? parent[prop]
                : defaultValue;
        }

        const subs = new CommandCollection();
        const cmd = new Command(
            filepath,
            data.name,
            data.def.aliases ?? [],
            data.def.clientPermissions ?? [],
            data.def.userPermissions,
            data.def.examples ?? [],
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
                          .filter(function (
                              a
                          ): a is [
                              string,
                              FlagDefinition & { shortcut: Char }
                          ] {
                              return a[1].shortcut !== undefined;
                          })
                          .map(([k, v]) => [v.shortcut, k])
                    : []
            ),
            data.executor,
            data.def.canUse,
            data.def.help ?? parentHelp,
            data.def.throttling,
            data.def.useThrottlerForSubs ?? true,
            data.def.ignore ?? resolveInheritance("ignored", false),
            data.def.devOnly ?? resolveInheritance("devOnly", false),
            data.def.guildOnly ?? resolveInheritance("guildOnly", false),
            data.def.deleteMessage ?? resolveInheritance("deleteMessage", false)
        );

        for (const subName in data.subs)
            subs.add(
                Command._build(
                    null,
                    commandSet,
                    data.subs[subName],
                    cmd,
                    (data.def.useHelpOnSubs ?? false) ||
                        (!data.def.help && !!parentHelp)
                        ? cmd._help
                        : undefined
                )
            );
        return cmd;
    }

    // === Getter =====================================================

    get clientPermissions() {
        return this._clientPermissions as readonly PermissionString[];
    }

    get userPermissions() {
        return this._userPermissions as readonly PermissionString[];
    }

    get throttler(): Throttler | undefined {
        if (this._throttler === null) return undefined;
        if (this._throttler) return this._throttler;
        if (this.parent && this.parent._useThrottlerOnSubs)
            return this.parent.throttler;
        return undefined;
    }

    /** Create and return an array containing all parent of this command, ordered from top-most command to this command (included). */
    getParents() {
        const parents: Command[] = [];
        parents.unshift(this);

        for (let parent = this.parent; parent; parent = parent.parent)
            parents.unshift(parent);

        return parents;
    }

    /** Return true if the client have required permission for this guild. */
    hasClientPermissions(guild: Guild) {
        return guild.me && guild.me.hasPermission(this._clientPermissions);
    }

    /** Return true if the member has required permissions to execute this command. */
    hasPermissions(member: GuildMember): boolean {
        if (!this._userPermissions) {
            if (this.parent) return this.parent.hasPermissions(member);
            else return true;
        }
        return member.hasPermission(this._userPermissions);
    }

    // =====================================================

    canUse(user: User, message: Message): boolean | string {
        if (this.parent) {
            const res = this.parent.canUse(user, message);
            if (res !== true) return res;
        }
        if (this._canUse) return this._canUse(user, message);
        return true;
    }

    /**
     * Call the help handler of this command and return true.
     * Return false if handler is undefined.
     * @param message
     * @param options
     */
    async help(message: Message, options: ParseOptions): Promise<boolean> {
        if (!this._help) return false;
        await this._help(this, {
            message,
            options,
            commandSet: this.commandSet,
        });
        return true;
    }

    /** @internal */
    async execute(
        message: Message,
        inputArguments: string[],
        options: ParseOptions,
        commandSet: CommandSet
    ) {
        if (message.guild && !this.hasClientPermissions(message.guild))
            throw new CommandResultError(
                CommandResultUtils.clientPermissions(this)
            );

        if (this.throttler?.throttled)
            throw new CommandResultError(CommandResultUtils.throttling(this));

        if (!this._executor)
            throw new CommandResultError(CommandResultUtils.noExecutor(this));

        const flags = parseFlags(
            message,
            inputArguments,
            this.flags,
            this._flagsShortcuts
        );
        const args = parseArgs(message, flags.args, this.args);

        const rest: ParsableType[] = [];
        if (this.rest) {
            for (const e of args.rest) {
                const parsed = parseValue(this.rest, message, e);
                if (parsed.value !== undefined) rest.push(parsed.value);
            }
        }

        if (
            this.throttler &&
            !options.devIDs.includes(message.author.id) &&
            !(
                !this._throttlingIncludeAdmins &&
                message.member &&
                message.member.permissions.has("ADMINISTRATOR")
            )
        )
            this.throttler.add();

        return await this._executor(
            Object.fromEntries(args.argValues),
            Object.fromEntries(flags.flagValues),
            {
                rest: rest as any,
                message,
                guild: message.guild,
                member: message.member,
                channel: message.channel,
                options,
                commandSet,
                command: this,
            }
        );
    }
}
