import { Command } from "../Command";
import { BaseQuery } from "./BaseQuery";

export interface ListQuery<Context = any> extends BaseQuery<Context> {
    commands: readonly Command<Context>[];
    allCommands: readonly Command<Context>[];
    page: number;
    pageCount: number;
}