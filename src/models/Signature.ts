import { Message } from "discord.js";

import Arg from "./Arg";
import CommandSet from "./CommandSet";
import ParseOptions from "./ParseOptions";
import { SignatureDef } from "./def/SignatureDef";
import { CommmandQuery } from "./CommandQuery";
import { ParsableType } from "./ParsableType";

export default class Signature {

    private _executor: (query: CommmandQuery) => any | Promise<any>;
    private _args: Arg[] = [];
    private _minArgNeeded = 0;

    constructor(def: SignatureDef) {

        this._executor = def.executor;

        if (def.args)
            for (const k of Object.keys(def.args))
                this._args.push(new Arg(k, def.args[k]));


        // TODO build Flags


        // make sure that mendatory arguments come before all optionals arguments.
        // also calculate min argument count
        let cur = true;
        for (const a of this._args) {
            if (cur && !a.isOptionnal)
                cur = false;
            if (!cur && a.isOptionnal)
                throw Error("Command signature : mendatory arguments must come before optionals arguments.");

            if (a.isOptionnal) {
                let c = a.parser.minArgNeeded;
                if (typeof (c) !== 'number' || c < 0) c = 1;
                this._minArgNeeded += c;
            }
        }
    }

    // === Getter ==========================================================================

    get minArgNeeded() { return this._minArgNeeded; }

    get argCount() { return this._args.length; }

    get executor() { return this._executor; }

    get usageString() {
        return this._args.map(a => a.usageString).join(" ");
    }

    get argDescription() {
        // make sure that the string is not empty
        return this._args.length == 0 ? '---' : this._args.map(a => `**${a.usageString}** ${a.description}`).join('\n');
    }

    // ==================

    tryParse(args: string[]) {
        // check if there is enough arguments.
        if (args.length < this._minArgNeeded) return;

        args = [...args]; // make a copy
        let neededArgCount = this._minArgNeeded;
        const parsed = new Map<string, ParsableType>();

        for (let i = 0; i < this._args.length; i++) {
            const arg = this._args[i];
            if (i < args.length) {
                const value = arg.parse(args[i]);
                if (value === undefined) return; // fail to parse the argument
                parsed.set(arg.name, value);
            } else if (arg.isOptionnal) {
                parsed.set(arg.name, arg.defaultValue);
            } else {
                return; // not enough provided arguments
            }
        }

        return parsed;
    }

}