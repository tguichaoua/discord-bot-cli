import { BaseQuery } from "./BaseQuery";
import { Command } from "../..";

export interface HelpQuery extends BaseQuery {
    command: Command;
}