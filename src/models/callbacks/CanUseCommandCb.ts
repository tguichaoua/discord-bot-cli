import { User, Message } from "discord.js";

export type CanUseCommandCb = (
    user: User,
    message: Message
) => boolean | string;
