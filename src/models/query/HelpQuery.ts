import { BaseQuery } from "./BaseQuery";
import { Command } from "../Command";

export interface HelpQuery extends BaseQuery {
    command: Command;
}