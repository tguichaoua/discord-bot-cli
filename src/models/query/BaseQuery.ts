import { Message } from "discord.js";
import { ParseOptions } from "../ParseOptions";

export interface BaseQuery<Context = any> {
    readonly message: Message;
    readonly context: Context;
    readonly options: ParseOptions;
}