import { ParsableType } from "./ParsableType";
import CommandSet from "./CommandSet";
import { BaseQuery } from "./query/BaseQuery";

export interface CommandQuery extends BaseQuery {
    readonly args: ReadonlyMap<string, ParsableType>;
    readonly flags: ReadonlyMap<string, ParsableType>;
    readonly rest: readonly string[];
    readonly commandSet: CommandSet;
}