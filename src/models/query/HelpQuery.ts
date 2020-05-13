import { BaseQuery } from "./BaseQuery";
import { Command } from "../Command";

export interface HelpQuery<Context = any> extends BaseQuery<Context> {
    command: Command;
}