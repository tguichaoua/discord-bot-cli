import { DefaultParser } from "./argParsers/DefaultParser";
import { ArgParserBase } from "./argParsers/ArgParserBase";

export default class Arg {

    private _name: string;
    private _description: string;
    private _parser: ArgParserBase;
    private _isMendatory: boolean;
    private _defaultValue: any;

    constructor(name: string, description: string, isMendatory = true, parser: ArgParserBase = new DefaultParser(), defaultValue?: any) {
        if (typeof name !== 'string' || name === '')
            throw Error('Argument\'s name must be a non-empty string');

        if (!(parser instanceof ArgParserBase))
            throw Error('Argument parser must inherit ArgParser.Base class.')

        this._name = name;
        this._description = description ?? "";
        this._parser = parser;
        this._isMendatory = isMendatory;
        this._defaultValue = defaultValue;
    }

    get name() { return this._name; }
    
    get description() { return this._description; }

    get parser() { return this._parser; }

    get isMendatory() { return this._isMendatory; }

    get defaultValue() { return this._defaultValue; }

    get usageString() {
        if (this.isMendatory) {
            return `<${this.name}>`;
        } else {
            const val = this.defaultValue ? ` = ${this.defaultValue}` : '';
            return `[${this.name}${val}]`;
        }
    }
}