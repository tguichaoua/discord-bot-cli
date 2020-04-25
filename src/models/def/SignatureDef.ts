import { CommmandQuery } from "../CommandQuery";
import { ArgDef } from "./ArgDef";
import { FlagDef } from "./FlagDef";

export interface SignatureDef {
    executor: (query: CommmandQuery) => any | Promise<any>;
    args?: { [name: string]: ArgDef };
    flags?: { [name: string]: FlagDef };
    rest?: { name: string, description?: string };
}