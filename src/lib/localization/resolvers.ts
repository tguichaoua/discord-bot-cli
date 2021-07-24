import { GuildMember, User } from "discord.js";
import { Localization } from "./Localization";

export type LocalizationResolvable = User | GuildMember;
export type LocalizationResolver = (user: LocalizationResolvable) => Localization | undefined;
export type LanguageResolver = (user: LocalizationResolvable) => string | undefined;
