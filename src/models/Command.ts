import { Message } from 'discord.js';
import { CommandSet } from "./CommandSet";
import { ParseOptions } from './ParseOptions';
import { CommandData } from './CommandData';
import { CommandDefinition } from './definition/CommandDefinition';
import { ArgDefinition } from './definition/ArgDefinition';
import { FlagDefinition } from './definition/FlagDefinition';
import { Char } from '../utils/char';
import { CommandExecutor } from './CommandExecutor';
import { parseFlags } from '../other/parsing/parseFlags';
import { parseArgs } from '../other/parsing/parseArgs';
import { RestDefinition } from './definition/RestDefinition';
import { CommandResultUtils } from './CommandResult';


export class Command {

    private constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly parent: Command | null,
        public readonly subs: ReadonlyMap<string, Command>,
        public readonly args: ReadonlyMap<string, ArgDefinition>,
        public readonly rest: Readonly<RestDefinition> | undefined,
        public readonly flags: ReadonlyMap<string, FlagDefinition>,
        private readonly _flagsShortcuts: ReadonlyMap<Char, string>,
        private readonly _executor: CommandExecutor<any> | undefined,
        public readonly deleteCommand: boolean,
        public readonly ignored: boolean,
        public readonly devOnly: boolean,
        public readonly guildOnly: boolean
    ) { }

    static build<T extends CommandDefinition>(data: CommandData<T>): Command { return Command._build(data, null); }

    private static _build<T extends CommandDefinition>(data: CommandData<T>, parent: Command | null): Command {
        const subs = new Map<string, Command>();
        const cmd = new Command(
            data.name,
            data.data.description ?? "",
            parent,
            subs,
            new Map(data.data.args ? Object.entries(data.data.args) : []),
            data.data.rest,
            new Map(data.data.flags ? Object.entries(data.data.flags) : []),
            new Map(data.data.flags ?
                Object.entries(data.data.flags)
                    .filter(function (a): a is [string, FlagDefinition & { shortcut: Char }] { return a[1].shortcut !== undefined })
                    .map(([k, v]) => [v.shortcut, k]) :
                []
            ),
            data.executor,
            data.data.deleteCommandMessage ?? true,
            data.data.ignore ?? false,
            data.data.dev ?? false,
            data.data.guildOnly ?? false,
        );

        for (const subName in data.subs)
            subs.set(subName, Command._build(data.subs[subName], cmd));
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

    /** @internal */
    async execute(message: Message, inputArguments: string[], options: ParseOptions, commandSet: CommandSet) {

        if (!this._executor) return CommandResultUtils.noExecutor(this);

        const flags = parseFlags(message, inputArguments, this.flags, this._flagsShortcuts);
        if (!flags) return;

        const args = parseArgs(message, flags.args, this.args);
        if (!args) return;

        return await this._executor(
            Object.fromEntries(args.argValues),
            Object.fromEntries(flags.flagValues),
            {
                rest: args.rest,
                message,
                options,
                commandSet
            }
        );
    }
}