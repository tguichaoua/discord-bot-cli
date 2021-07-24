import { Message } from "discord.js";

import { Command } from "./Command";
import { CommandSet } from "./CommandSet";
import { CommandSetOptions } from "./CommandSetOptions";

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
