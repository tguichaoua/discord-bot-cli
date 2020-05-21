import { User, TextChannel, Channel, GuildChannel, DMChannel, VoiceChannel, CategoryChannel, NewsChannel, StoreChannel } from "discord.js";

export type ParsableTypeName = "string" | "boolean" | "integer" | "float" |
    "user" |
    "channel" | "guildChannel" | "dmChannel" | "textChannel" | "voiceChannel" | "categoryChannel" | "newsChannel" | "storeChannel";

export type ParsableType = null | string | boolean | number |
    User |
    Channel | GuildChannel | DMChannel | TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel;

/** @internal */
export type ParsableTypeOf<Name extends ParsableTypeName> =
    Name extends "string" ? string :
    Name extends "boolean" ? boolean :
    Name extends "integer" ? number :
    Name extends "float" ? number :

    Name extends "user" ? User :

    Name extends "channel" ? Channel :
    Name extends "guildChannel" ? GuildChannel :
    Name extends "dmChannel" ? DMChannel :
    Name extends "textChannel" ? TextChannel :
    Name extends "voiceChannel" ? VoiceChannel :
    Name extends "categoryChannel" ? CategoryChannel :
    Name extends "newsChannel" ? NewsChannel :
    Name extends "storeChannel" ? StoreChannel :
    never;

/** @internal */
export function getDefaultValue(name: ParsableTypeName): ParsableType {
    switch (name) {
        case "string": return "";
        case "integer": case "float": return 0;
        case "boolean": return false;

        case "user":

        case "channel":
        case "guildChannel":
        case "dmChannel":
        case "textChannel":
        case "voiceChannel":
        case "categoryChannel":
        case "newsChannel":
        case "storeChannel":
            return null;
    }
}