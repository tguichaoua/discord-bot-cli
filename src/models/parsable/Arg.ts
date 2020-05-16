import { ArgDef } from "../def/ArgDef";
import { Parsable } from "./Parsable";

/** @ignore */
export class Arg extends Parsable {

    private _isOptional: boolean;

    constructor(name: string, def: ArgDef) {
        super(name, def);
        this._isOptional = !!def.optional;
    }

    get isOptional() { return this._isOptional; }
}