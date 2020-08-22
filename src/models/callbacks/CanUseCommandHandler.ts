import { User, Message } from "discord.js";

export type CanUseCommandHandler = (
    user: User,
    message: Message
) => boolean | string;
