import { CommmandQuery } from "../CommandQuery";
import { ArgDef } from "./ArgDef";
import { FlagDef } from "./FlagDef";

export interface SignatureDef {
    executor: (query: CommmandQuery) => any;
    args?: { [name: string]: ArgDef };
    flags?: { [name: string]: FlagDef }
}