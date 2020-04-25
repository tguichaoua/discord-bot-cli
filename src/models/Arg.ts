import { ArgDef } from "./def/ArgDef";
import { Parsable } from "./Parsable";

export default class Arg extends Parsable {

    private _isOptional: boolean;

    constructor(name: string, def: ArgDef) {
        super(name, def);
        this._isOptional = !!def.optional;
    }

    get isOptional() { return this._isOptional; }

    get usageString() {
        if (this.isOptional) {
            return `<${this.name}>`;
        } else {
            const val = this.defaultValue ? ` = ${this.defaultValue}` : '';
            return `[${this.name}${val}]`;
        }
    }
}