import { Message } from "discord.js";

import { Command } from "./Command";
import { CommandManager } from "./CommandManager";
import { CommandManagerOptions } from "./CommandManagerOptions";

/**
 * Function called to generate help for a command.
 * @category Handler
 */
export type HelpHandler = (
    command: Command,
    context: {
        message: Message;
        options: CommandManagerOptions;
        commandManager: CommandManager;
    },
) => void | Promise<void>;
