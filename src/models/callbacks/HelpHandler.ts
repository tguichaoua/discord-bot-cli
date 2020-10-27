import { Message } from "discord.js";
import { Command } from "../Command";
import { CommandSetOptions } from "../CommandSetOptions";
import { CommandSet } from "../CommandSet";

/**
 * Function called to generate help for a command.
 * @category Handler
 */
export type HelpHandler = (
    command: Command,
    context: {
        message: Message;
        options: CommandSetOptions;
        commandSet: CommandSet;
    },
) => void | Promise<void>;
