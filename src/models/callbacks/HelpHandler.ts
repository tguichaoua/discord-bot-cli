import { Message } from "discord.js";
import { Command } from "../Command";
import { CommandSetOptions } from "../ParseOptions";
import { CommandSet } from "../CommandSet";

export type HelpHandler = (
    command: Command,
    context: {
        message: Message;
        options: CommandSetOptions;
        commandSet: CommandSet;
    }
) => void | Promise<void>;
