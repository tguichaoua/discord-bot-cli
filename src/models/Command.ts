import { Message, User } from 'discord.js';
import { CommandSet } from "./CommandSet";
import { ParseOptions } from './ParseOptions';
import { CommandData } from './CommandData';
import { CommandDefinition } from './definition/CommandDefinition';
import { ArgDefinition } from './definition/ArgDefinition';
import { FlagDefinition } from './definition/FlagDefinition';
import { Char } from '../utils/char';
import { CommandExecutor } from './callbacks/CommandExecutor';
import { parseFlags } from '../other/parsing/parseFlags';
import { parseArgs } from '../other/parsing/parseArgs';
import { RestDefinition } from './definition/RestDefinition';
import { CommandResultUtils } from './CommandResult';
import { CommandResultError } from './CommandResultError';
import { ReadonlyCommandCollection, CommandCollection } from './CommandCollection';
import { CanUseCommandCb } from './callbacks/CanUseCommandCb';


export class Command {

    private constructor(
        public readonly name: string,
        public readonly aliases: readonly string[],
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
        public readonly ignored: boolean,
        public readonly devOnly: boolean,
        public readonly guildOnly: boolean
    ) { }

    static build<T extends CommandDefinition>(commandSet: CommandSet, data: CommandData<T>): Command { return Command._build(commandSet, data, null); }

    private static _build<T extends CommandDefinition>(commandSet: CommandSet, data: CommandData<T>, parent: Command | null): Command {
        function resolveInheritance<K extends keyof Command>(prop: K, defaultValue: Command[K]): Command[K] {
            return (((data.def.inherit ?? true) && parent) ? parent[prop] : defaultValue);
        }

        const subs = new CommandCollection();
        const cmd = new Command(
            data.name,
            data.def.aliases ?? [],
            data.def.examples ?? [],
            data.def.description ?? "",
            parent,
            commandSet,
            subs,
            new Map(data.def.args ? Object.entries(data.def.args) : []),
            data.def.rest,
            new Map(data.def.flags ? Object.entries(data.def.flags) : []),
            new Map(data.def.flags ?
                Object.entries(data.def.flags)
                    .filter(function (a): a is [string, FlagDefinition & { shortcut: Char }] { return a[1].shortcut !== undefined })
                    .map(([k, v]) => [v.shortcut, k]) :
                []
            ),
            data.executor,
            data.def.canUse,
            data.def.ignore ?? resolveInheritance("ignored", false),
            data.def.devOnly ?? resolveInheritance("devOnly", false),
            data.def.guildOnly ?? resolveInheritance("guildOnly", false),
        );

        for (const subName in data.subs)
            subs.add(Command._build(commandSet, data.subs[subName], cmd));
        return cmd;
    }

    // === Getter =====================================================

    /** Create and return an array containing all parent of this command, ordered from top-most command to this command (included). */
    getParents() {
        const parents: Command[] = [];
        parents.unshift(this);

        for (let parent = this.parent; parent; parent = parent.parent)
            parents.unshift(parent);

        return parents;
    }

    // =====================================================

    canUse(user: User, message: Message): boolean | string {
        if (this.parent) {
            const res = this.parent.canUse(user, message);
            if (res !== true) return res;
        }
        if (this._canUse)
            return this._canUse(user, message);
        return true;
    }

    /** @internal */
    async execute(message: Message, inputArguments: string[], options: ParseOptions, commandSet: CommandSet) {

        if (!this._executor) throw new CommandResultError(CommandResultUtils.noExecutor(this));

        const flags = parseFlags(message, inputArguments, this.flags, this._flagsShortcuts);
        const args = parseArgs(message, flags.args, this.args);

        return await this._executor(
            Object.fromEntries(args.argValues),
            Object.fromEntries(flags.flagValues),
            {
                rest: args.rest,
                message,
                guild: message.guild,
                member: message.member,
                options,
                commandSet
            }
        );
    }
}