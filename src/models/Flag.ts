import { Parsable } from "./Parsable";
import { FlagDef } from "./def/FlagDef";


export class Flag extends Parsable {

    constructor(name: string, def: FlagDef) {
        super(name, def);

    }


}