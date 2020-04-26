import { ArgDef } from "./def/ArgDef";
import { Parsable } from "./Parsable";
import { ParsableLocalization } from "./localization/ParsableLocalization";
import { TypeNameLocalization } from "./localization/TypeNameLocalization";

export class Arg extends Parsable {

    private _isOptional: boolean;

    constructor(name: string, def: ArgDef) {
        super(name, def);
        this._isOptional = !!def.optional;
    }

    get isOptional() { return this._isOptional; }

    getUsageString(localization?: ParsableLocalization) {
        if (this.isOptional) {
            const val = this.defaultValue ? ` = ${this.defaultValue}` : '';
            return `[${this.getName(localization)}${val}]`;
        } else {
            return `<${this.getName(localization)}>`;
        }
    }

    getDescriptionString(typeNameLocalization: TypeNameLocalization, localization?: ParsableLocalization) {
        return `**${this.getUsageString(localization)}** *(${typeNameLocalization[this.type]})* - ${this.getDescription(localization)}`;
    }
}