/** @ignore *//** */

import { Parsable } from "./Parsable";
import { FlagDef } from "../def/FlagDef";
import { TypeNameLocalization } from "../localization/TypeNameLocalization";
import { ParsableLocalization } from "../localization/ParsableLocalization";

export class Flag extends Parsable {

    public readonly shortcut?: string;

    constructor(name: string, def: FlagDef) {
        super(name, def);
        this.shortcut = def.shortcut;
    }

    getDescriptionString(typeNameLocalization: TypeNameLocalization, localization?: ParsableLocalization) {
        return `**--${this.name}${(this.shortcut ? ` -${this.shortcut}` : "")}** *(${typeNameLocalization[this.type]})* - ${this.getDescription(localization)}`;
    }

}