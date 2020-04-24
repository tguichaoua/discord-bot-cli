import { Message } from "discord.js";
import { ParseOption, CommandSet } from "..";

export interface CommmandQuery {
    message: Message,
    args: ReadonlyMap<string, any>,
    context: any,
    options: ParseOption,
    commandSet: CommandSet
}