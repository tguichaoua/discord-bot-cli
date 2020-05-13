import { Command } from "../Command";
import { BaseQuery } from "./BaseQuery";

export interface ListQuery<Context = any> extends BaseQuery<Context> {
    commands: readonly Command[];
    allCommands: readonly Command[];
    page: number;
    pageCount: number;
}