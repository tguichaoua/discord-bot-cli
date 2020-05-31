import { Message } from 'discord.js';

import { CommandSet } from "./CommandSet";
import * as CommandResult from "./CommandResult";

import { ParseOptions } from './ParseOptions';
import { FlagInfo } from './FlagInfo';

import { HelpUtility } from "../other/HelpUtility";
import { CommandData } from './CommandData';
import { CommandDefinition } from './definition/CommandDefinition';
import { ArgDefinition } from './definition/ArgDefinition';
import { FlagDefinition } from './definition/FlagDefinition';
import { Char } from '../utils/char';
import { CommandExecutor } from './CommandExecutor';
import { parseFlags } from '../other/parsing/parseFlags';
import { parseArgs } from '../other/parsing/parseArgs';


export class Command {

    private constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly parent: Command | null,
        public readonly subs: ReadonlyMap<string, Command>,
        public readonly args: ReadonlyMap<string, ArgDefinition>,
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
            "",
            data.data.description ?? "",
            parent,
            subs,
            new Map(data.data.args ? Object.entries(data.data.args) : []),
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


    // /** @internal */
    // async init(context: Context, commandSet: CommandSet) {
    //     if (this.isInitialized)
    //         return;

    //     // inherit from parent
    //     if (this._parent && this._inherit) {
    //         for (const k of Object.keys(this._settings) as (keyof Command["_settings"])[]) {
    //             this._settings[k].inherit(this._parent._settings[k]);
    //         }
    //     }

    //     // init sub commands
    //     for (const s of this._subs.values()) {
    //         await s.init(context, commandSet);
    //     }

    //     // order signature to make sure the most suitable signature is called
    //     // signature with greater count of arguments come firts
    //     // the adding order is preserved (signatures added first comes first)
    //     this._signatures = this._signatures
    //         .map((val, idx) => { return { val: val, idx: idx } })
    //         .sort((a, b) => {
    //             if (a.val.arguments.length > b.val.arguments.length) return -1;
    //             if (a.val.arguments.length < b.val.arguments.length) return 1;
    //             return a.idx - b.idx;
    //         })
    //         .map(o => o.val);
    //     if (this._onInit)
    //         await this._onInit(context, commandSet);
    //     this._isInitialized = true;
    // }

    /** @internal */
    async execute(message: Message, args: string[], options: ParseOptions, commandSet: CommandSet) {

        if (!this._executor) return;

        const flags = parseFlags(message, args, this.flags, this._flagsShortcuts);
        if (!flags) return;

        const argValues = parseArgs(message, flags.args, this.args);

        await this._executor(
            Object.fromEntries(argValues),
            Object.fromEntries(flags.flagValues),
            {
                rest: [],
                message,
                options,
                commandSet
            }
        );

        // /// OLD CODE
        // const flagInfos: FlagInfo[] = [];

        // for (let i = 0; i < args.length; i++) {
        //     let inFlag = args[i];

        //     if (inFlag.match(/^--[^-].+$/)) {
        //         const part = inFlag.substring(2).split(/=(.+)/);
        //         let value = part.length > 1 ? part[1] : undefined;
        //         flagInfos.push({ type: "full", name: part[0], value });
        //     } else if (inFlag.match(/^-[a-zA-Z]$/)) {
        //         flagInfos.push({
        //             type: "shortcut",
        //             name: inFlag.substring(1),
        //             valueIndex: i + 1 === args.length ? undefined : i
        //         });
        //     } else if (inFlag.match(/^-[a-zA-Z]{2,}$/)) {
        //         const flagNames = inFlag.substring(1).split("");

        //         for (const flagName of flagNames) {
        //             flagInfos.push({
        //                 type: "shortcut",
        //                 name: flagName,
        //             });
        //         }
        //     } else
        //         continue;

        //     args.splice(i, 1); // remove the flag from args
        //     i--; // make sure to not skip an argument.
        // }





        // for (const s of this._signatures) {
        //     try {
        //         const parsedData = s.tryParse(message, args, flagInfos);
        //         if (parsedData) {
        //             const result = await s.executor(
        //                 {
        //                     message,
        //                     args: parsedData.parsedArgs,
        //                     flags: parsedData.parsedFlags,
        //                     rest: parsedData.rest,
        //                     context,
        //                     options,
        //                     commandSet
        //                 }
        //             );
        //             return CommandResult.ok(this, s, result);
        //         }
        //     } catch (e) {
        //         return CommandResult.error(e);
        //     }
        // }

        // if (options.helpOnSignatureNotFound) {
        //     const embed = HelpUtility.Command.embedHelp(this, options.prefix, options.localization);
        //     await message.author.send(`You make an error typing the following command\n\`${message.content}\``, embed);
        // }

        // return CommandResult.signatureNotFound(this);
    }
}