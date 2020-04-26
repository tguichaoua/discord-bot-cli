/** @ignore *//** */

import { Arg } from "./parsable/Arg";
import { SignatureDef } from "./def/SignatureDef";
import { CommandQuery } from "./query/CommandQuery";
import { ParsableType } from "./ParsableType";
import { Parsable } from "./parsable/Parsable";
import { FlagInfo } from "./FlagInfo";
import { Message } from "discord.js";
import { Localization } from "./localization/Localization";
import { CommandLocalization } from "./localization/CommandLocalization";
import { Command } from "./Command";
import { Flag } from "./parsable/Flag";

export class Signature {

    private _executor: (query: CommandQuery) => any | Promise<any>;
    private _args: Arg[] = [];
    private _flags = new Map<string, Flag>();
    private _flagAlias = new Map<string, Flag>();
    private _minArgNeeded: number;
    private _rest?: { name: string; description?: string };

    constructor(public readonly command: Command, def: SignatureDef) {

        this._executor = def.executor;

        if (def.args)
            for (const k of Object.keys(def.args))
                this._args.push(new Arg(k, def.args[k]));

        this._rest = def.rest;

        // build Flags
        if (def.flags)
            for (const name of Object.keys(def.flags)) {
                const d = def.flags[name];
                const flag = new Flag(name, d);
                this._flags.set(name, flag);
                if (d.shortcut)
                    this._flagAlias.set(d.shortcut, flag);
            }

        // make sure that mendatory arguments come before all optionals arguments.
        // also calculate min argument count
        let cur = true;
        for (const a of this._args) {
            if (cur && a.isOptional)
                cur = false;
            if (!cur && !a.isOptional)
                throw Error("Command signature : mendatory arguments must come before optionals arguments.");
        }

        this._minArgNeeded = this._args.filter(a => !a.isOptional).length;
    }

    // === Getter ==========================================================================

    get rest() { return this._rest; }

    get argCount() { return this._args.length; }

    get executor() { return this._executor; }

    getUsageString(localization?: CommandLocalization) {
        return this._args.map(a => a.getUsageString((localization?.args ?? {})[a.name])).join(" ")
            + (this._rest ? `[...${localization?.rest?.name ?? this._rest.name}]` : "");
    }

    getArgumentsDescription(localization: Localization) {
        const cmdLoc = localization.commands[this.command.name];
        // make sure that the string is not empty
        return this._args.map(a => a.getDescriptionString(localization.typeNames, (cmdLoc?.args ?? {})[a.name])).join('\n')
            + (this._rest ? `\n**[...${cmdLoc?.rest?.name ?? this._rest.name}]** - ${cmdLoc?.rest?.description ?? this._rest.description}` : "");
    }

    getFlagsDescription(localization: Localization) {
        const cmdLoc = localization.commands[this.command.name];
        // make sure that the string is not empty
        return Array.from(this._flags.values())
            .map(f => f.getDescriptionString(localization.typeNames, (cmdLoc?.args ?? {})[f.name])).join('\n');
    }

    // ==================

    tryParse(message: Message, args: readonly string[], flagInfos: readonly FlagInfo[]) {

        const parsedFlags = new Map<string, ParsableType>(Array.from(this._flags.values()).map(f => [f.name, f.defaultValue]));
        const consumedArgIndex: number[] = []

        for (const fi of flagInfos) {
            let flag: Parsable | undefined;
            switch (fi.type) {
                case "full":
                    flag = this._flags.get(fi.name);
                    if (!flag) continue;

                    if (fi.value) {
                        const parsedValue = flag.parse(message, fi.value);
                        if (parsedValue)
                            parsedFlags.set(flag.name, parsedValue);
                        else
                            return; // invalid value for this flag
                    } else if (flag.type === "boolean")
                        parsedFlags.set(flag.name, true);
                    else
                        return; // the flag require a value, but nothing was provided

                    break;
                case "shortcut":
                    flag = this._flags.get(fi.name);
                    if (!flag) continue;

                    if (flag.type === "boolean")
                        parsedFlags.set(flag.name, true);
                    else {
                        if (!fi.valueIndex) return; // the flag require a value, but nothing was provided
                        const parsedValue = flag.parse(message, args[fi.valueIndex]);
                        if (!parsedValue) return; // invalid value for this flag
                        consumedArgIndex.push(fi.valueIndex);
                        parsedFlags.set(flag.name, parsedValue);
                    }
                    break;
            }
        }

        // remove arguments consumed by flags
        const _args = args.filter((_, i) => !consumedArgIndex.includes(i));

        if (_args.length < this._minArgNeeded) return; // check if there is enough arguments.

        const parsedArgs = new Map<string, ParsableType>();
        for (let i = 0; i < this._args.length; i++) {
            const arg = this._args[i];
            if (i < args.length) {
                const value = arg.parse(message, args[i]);
                if (value === undefined) return; // fail to parse the argument
                parsedArgs.set(arg.name, value);
            } else if (arg.isOptional) {
                parsedArgs.set(arg.name, arg.defaultValue);
            } else {
                return; // not enough provided arguments
            }
        }

        // remove parsed arguments;
        _args.splice(0, this._args.length)

        return { parsedArgs, parsedFlags, rest: _args };
    }

}