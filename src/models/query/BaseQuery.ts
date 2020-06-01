import { Message } from "discord.js";
import { ParseOptions } from "../ParseOptions";

export interface BaseQuery {
    readonly message: Message;
    readonly options: ParseOptions;
}