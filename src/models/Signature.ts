import Arg from "./Arg";
import { SignatureDef } from "./def/SignatureDef";
import { CommmandQuery } from "./CommandQuery";
import { ParsableType } from "./ParsableType";

export default class Signature {

    private _executor: (query: CommmandQuery) => any | Promise<any>;
    private _args: Arg[] = [];

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
        
        if (args.length < this.argCount) return; // check if there is enough arguments.

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

        return parsedArgs;
    }

}