import { ParsableType } from "../ParsableType";
import {CommandSet} from "../CommandSet";
import { BaseQuery } from "./BaseQuery";

export interface CommandQuery<Context = any> extends BaseQuery<Context> {
    readonly args: ReadonlyMap<string, ParsableType>;
    readonly flags: ReadonlyMap<string, ParsableType>;
    readonly rest: readonly string[];
    readonly commandSet: CommandSet<Context>;
}