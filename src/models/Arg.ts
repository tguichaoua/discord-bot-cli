import { DefaultParser } from "../argParsers/DefaultParser";
import { ArgParserBase } from "../argParsers/ArgParserBase";
import { ArgDef } from "./def/ArgDef";
import { ArgParser } from "./ArgParser";
import { NumberParser } from "../argParsers/Number";
import { ParsableTypeName } from "./ParsableTypeName";

export default class Arg {

    private _name: string;
    private _description: string;
    private _type: ParsableTypeName;
    private _isOptionnal: boolean;
    private _defaultValue: any;

    constructor(name: string, def: ArgDef) {
        if (typeof name !== "string" || name === "")
            throw Error("Argument's name must be a non-empty string");

        this._name = name;
        this._description = def.description ?? "";
        this._type = def.type;
        this._isOptionnal = !!def.optionnal;
        this._defaultValue = def.optionnal ? def.defaultValue : undefined;
    }

    get name() { return this._name; }

    get description() { return this._description; }

    get isMendatory() { return this._isOptionnal; }

    get defaultValue() { return this._defaultValue; }

    get usageString() {
        if (this.isMendatory) {
            return `<${this.name}>`;
        } else {
            const val = this.defaultValue ? ` = ${this.defaultValue}` : '';
            return `[${this.name}${val}]`;
        }
    }

    parse(argument: string) {
        switch(this._type) {
            // TODO




        }
    }
}