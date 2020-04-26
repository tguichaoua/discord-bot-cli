import { Message } from "discord.js";
import { ParseOptions } from "../ParseOptions";

export interface BaseQuery {
    readonly message: Message;
    readonly context: any;
    readonly options: ParseOptions;
}