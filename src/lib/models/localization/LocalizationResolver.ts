import { GuildMember, User } from "discord.js";
import { Localization } from "./Localization";

export type LocalizationResolver = (user: User | GuildMember) => Localization;
