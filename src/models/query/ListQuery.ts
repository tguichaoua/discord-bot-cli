import { Command } from "../..";
import { BaseQuery } from "./BaseQuery";

export interface ListQuery extends BaseQuery {
    commands: readonly Command[];
    page: number;
    pageCount: number;
}