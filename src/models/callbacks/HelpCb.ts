import { Message } from "discord.js";
import { Command } from "../Command";
import { ParseOptions } from "../ParseOptions";
import { CommandSet } from "../CommandSet";

export type HelpCb = (command: Command, context: {
    message: Message;
    options: ParseOptions;
    commandSet: CommandSet;
}) => void;