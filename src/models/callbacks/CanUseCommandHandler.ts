import { User, Message } from "discord.js";

/**
 * Handler to determine if a user can use the command.
 */
export type CanUseCommandHandler = (
    user: User,
    message: Message
) => boolean | string;
