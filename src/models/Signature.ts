import { Message } from "discord.js";

import Arg from "./Arg";
import CommandSet from "./CommandSet";
import ParseOption from "./ParseOption";
import { SignatureDef } from "./def/SignatureDef";
import { CommmandQuery } from "./CommandQuery";

export default class Signature {

    private _executor: (query: CommmandQuery) => any | Promise<any>;
    private _args: Arg[];
    private _minArgNeeded = 0;

    constructor(def: SignatureDef) {
    
        this._executor = def.executor;

        if (def.args)
            for (const k of Object.keys(def.args)) {
                const d = def.args[k];
                



            }





        if (Array.isArray(def.args))
            this._args = def.args.filter(a => a instanceof Arg);
        else
            this._args = [];

        // make sure that mendatory arguments come before all optionals arguments.
        // also calculate min argument count
        let cur = true;
        for (const a of this._args) {
            if (cur && !a.isMendatory)
                cur = false;
            if (!cur && a.isMendatory)
                throw Error("Command signature : mendatory arguments must come before optionals arguments.");

            if (a.isMendatory) {
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
        if (!Array.isArray(args)) return;

        // check if there is enough arguments.
        if (args.length < this._minArgNeeded) return;

        args = [...args]; // make a copy
        let neededArgCount = this._minArgNeeded;
        const parsed = new Map<string, any>();

        for (const a of this._args) {
            if (!a.isMendatory) {
                if (args.length === 0) {
                    parsed.set(a.name, a.defaultValue);
                    continue;
                }
                if (args.length < a.parser.minArgNeeded) {
                    return; // fail because the arg parser have not enough argument to parse
                }
            }

            const result = a.parser.parse(args);
            if (result) {
                let { value, consumed } = result;
                if (typeof consumed !== 'number' || consumed < 0) consumed = 0;

                args.splice(0, consumed);

                if (a.isMendatory) {
                    // if there is not enough arguments left for others argument parser return.
                    neededArgCount -= a.parser.minArgNeeded;
                    if (args.length < neededArgCount) return;
                }

                parsed.set(a.name, value);
            } else
                return; // result is undefined mean that the arg parser fail, so this signature fail too.

        }
        return parsed;
    }

}