import { CommandQuery } from "../query/CommandQuery";
import { ArgDef } from "./ArgDef";
import { FlagDef } from "./FlagDef";

export interface SignatureDef<Context = any> {
    /** Called when this signature is executed. */
    executor: (query: CommandQuery<Context>) => any | Promise<any>;
    /** Defined what are arguments of this signature and how they must be parsed. */
    args?: { [name: string]: ArgDef };
    /** Defined what are flags of this signature and how they must be parsed. */
    flags?: { [name: string]: FlagDef };
    /** Define a name and a description for a rest argument. Used for help purpose. */
    rest?: { name: string, description?: string };
}