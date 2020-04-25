import { Message } from "discord.js";
import { ParsableType } from "./ParsableType";
import { ParseOptions } from "./ParseOptions";
import CommandSet from "./CommandSet";

export interface CommmandQuery {
    readonly message: Message;
    readonly args: ReadonlyMap<string, ParsableType>;
    readonly flags: ReadonlyMap<string, ParsableType>;
    readonly rest: readonly string[];
    readonly context: any;
    readonly options: ParseOptions;
    readonly commandSet: CommandSet;
}