import { Message } from "discord.js";
import { ParsableType } from "./ParsableType";
import { ParseOptions } from "./ParseOptions";
import CommandSet from "./CommandSet";

export interface CommmandQuery {
    message: Message,
    args: ReadonlyMap<string, ParsableType>,
    flags: ReadonlyMap<string, ParsableType>,
    context: any,
    options: ParseOptions,
    commandSet: CommandSet
}