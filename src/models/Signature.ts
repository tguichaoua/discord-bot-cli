import Arg from "./Arg";
import { SignatureDef } from "./def/SignatureDef";
import { CommmandQuery } from "./CommandQuery";
import { ParsableType } from "./ParsableType";
import { FlagDef } from "./def/FlagDef";
import { Parsable } from "./Parsable";
import { notPrefixed } from "./CommandResult";
import { Char } from "../utils/char";
import { Z_DEFAULT_STRATEGY } from "zlib";

export default class Signature {

    private _executor: (query: CommmandQuery) => any | Promise<any>;
    private _args: Arg[] = [];
    private _flags = new Map<string, Parsable>();
    private _flagAlias = new Map<string, Parsable>();

    constructor(def: SignatureDef) {

        this._executor = def.executor;

        if (def.args)
            for (const k of Object.keys(def.args))
                this._args.push(new Arg(k, def.args[k]));


        // build Flags
        if (def.flags)
            for (const name of Object.keys(def.flags)) {
                const d = def.flags[name];
                const flag = new Parsable(name, d);
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
    }

    // === Getter ==========================================================================

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

    tryParse(args: readonly string[]) {

        const _args = [...args];

        const parsedFlags = new Map<string, ParsableType>(Array.from(this._flags.values()).map(f => [f.name, f.defaultValue]));

        for (let i = 0; i < args.length; i++) {
            let inFlag = args[i];

            if (inFlag.match(/^--[^-].+$/)) {
                const part = inFlag.substring(2).split(/=(.+)/);
                const flag = this._flags.get(part[0]);
                if (!flag) continue;

                if (part.length === 1) {
                    if (flag.type === "boolean")
                        parsedFlags.set(flag.name, true);
                    else
                        return; // this flag need a value, but there is no value
                } else {
                    const parsedValue = flag.parse(part[1]);
                    if (!parsedValue) return;
                    parsedFlags.set(flag.name, parsedValue);
                }
                _args.splice(i, 1);
                i--;
            } else if (inFlag.match(/^-[a-zA-Z]$/)) {
                const flag = this._flagAlias.get(inFlag.substring(1));

                if (!flag) continue;
                if (flag.type === "boolean") {
                    parsedFlags.set(flag.name, true);
                    _args.splice(i, 1);
                    i--;
                }
                else {
                    if (i + 1 >= _args.length) return; // this flag need a value, but there is no value
                    const parsedValue = flag.parse(_args[i + 1]);
                    if (!parsedValue) return;
                    parsedFlags.set(flag.name, parsedValue);
                    _args.splice(i, 2);
                    i--;
                }
            } else if (inFlag.match(/^-[a-zA-Z]{2,}$/)) {
                const flagNames = inFlag.substring(1).split("");
                for (const flagName of flagNames) {
                    const flag = this._flagAlias.get(flagName);
                    if (!flag) continue;
                    if (flag.type === "boolean") {
                        parsedFlags.set(flag.name, true);
                        _args.splice(i, 1);
                        i--;
                    }
                    else {
                        if (i + 1 >= _args.length) return; // this flag need a value, but there is no value
                        const parsedValue = flag.parse(_args[i + 1]);
                        if (!parsedValue) return;
                        parsedFlags.set(flag.name, parsedValue);
                        _args.splice(i, 2);
                        i--;
                    }
                }
            }
        }

        if (_args.length < this.argCount) return; // check if there is enough arguments.

        const parsedArgs = new Map<string, ParsableType>();
        for (let i = 0; i < this._args.length; i++) {
            const arg = this._args[i];
            if (i < args.length) {
                const value = arg.parse(args[i]);
                if (value === undefined) return; // fail to parse the argument
                parsedArgs.set(arg.name, value);
            } else if (arg.isOptional) {
                parsedArgs.set(arg.name, arg.defaultValue);
            } else {
                return; // not enough provided arguments
            }
        }

        const rest = _args.splice(0, this._args.length)
        
        return { parsedArgs, parsedFlags, rest };
    }

}