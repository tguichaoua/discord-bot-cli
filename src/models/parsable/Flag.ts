import { Parsable } from "./Parsable";
import { FlagDef } from "../def/FlagDef";

/** @ignore */
export class Flag extends Parsable {

    public readonly shortcut?: string;

    constructor(name: string, def: FlagDef) {
        super(name, def);
        this.shortcut = def.shortcut;
    }



}