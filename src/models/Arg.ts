import { DefaultParser } from "../argParsers/DefaultParser";
import { ArgParserBase } from "../argParsers/ArgParserBase";
import { ArgDef } from "./def/ArgDef";
import { ArgParser } from "./ArgParser";
import { NumberParser } from "../argParsers/Number";
import { ParsableTypeName, ParsableType } from "./ParsableType";

export default class Arg {

    private _name: string;
    private _description: string;
    private _type: ParsableTypeName;
    private _isOptionnal: boolean;
    private _defaultValue?: ParsableType;
    private _validator?: (o: any) => boolean;

    constructor(name: string, def: ArgDef) {
        if (typeof name !== "string" || name === "")
            throw Error("Argument's name must be a non-empty string");

        this._name = name;
        this._description = def.description ?? "";
        this._type = def.type;
        this._isOptionnal = !!def.optionnal;
        this._defaultValue = def.optionnal ? def.defaultValue ?? getDefaultType(def.type) : undefined;
        this._validator = def.validator;
    }

    get name() { return this._name; }

    get description() { return this._description; }

    get isOptionnal() { return this._isOptionnal; }

    get defaultValue() {
        if (this._defaultValue === undefined)
            throw new Error("You cannot read default value of not optionnal argument.");
        return this._defaultValue;
    }

    get usageString() {
        if (this.isOptionnal) {
            return `<${this.name}>`;
        } else {
            const val = this.defaultValue ? ` = ${this.defaultValue}` : '';
            return `[${this.name}${val}]`;
        }
    }

    parse(argument: string) {
        let value;
        switch (this._type) {
            case "string":
                value = argument;
                break;
            case "integer":
                value = parseInt(argument);
                break;
            case "float":
                value = parseFloat(argument);
                break;
            case "boolean":
                switch (argument.toLocaleLowerCase()) {
                    case "true":
                    case "1":
                        value = true;
                        break;
                    case "false":
                    case "0":
                        value = false;
                        break;
                }
                break;
        }
        if (value !== undefined && (!this._validator || this._validator(value)))
            return value;
    }
}

function getDefaultType(name: ParsableTypeName): ParsableType {
    switch (name) {
        case "string": return "";
        case "integer": case "float": return 0;
        case "boolean": return false;
    }
}