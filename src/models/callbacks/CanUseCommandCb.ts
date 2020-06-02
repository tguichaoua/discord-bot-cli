import { User } from "discord.js";

export type CanUseCommandCb = (user: User) => boolean | string;