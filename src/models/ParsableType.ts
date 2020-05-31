import { User, TextChannel, Channel, GuildChannel, DMChannel, VoiceChannel, CategoryChannel, NewsChannel, StoreChannel, Role } from "discord.js";

export type ParsableTypeName = "string" | "boolean" | "integer" | "float" |
    "user" | "role" |
    "channel" | "guild channel" | "dm channel" | "text channel" | "voice channel" | "category channel" | "news channel" | "store channel";

export type ParsableType = string | boolean | number |
    User | Role |
    Channel | GuildChannel | DMChannel | TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel;

/** @internal */
export type ParsableTypeOf<Name extends ParsableTypeName> =
    Name extends "string" ? string :
    Name extends "boolean" ? boolean :
    Name extends "integer" ? number :
    Name extends "float" ? number :

    Name extends "user" ? User :
    Name extends "role" ? Role :

    Name extends "channel" ? Channel :
    Name extends "guild channel" ? GuildChannel :
    Name extends "dm channel" ? DMChannel :
    Name extends "text channel" ? TextChannel :
    Name extends "voice channel" ? VoiceChannel :
    Name extends "category channel" ? CategoryChannel :
    Name extends "news channel" ? NewsChannel :
    Name extends "store channel" ? StoreChannel :
    never;

/** @internal */
export function getDefaultValue(name: ParsableTypeName): ParsableType {
    switch (name) {
        case "string": return "";
        case "integer": case "float": return 0;
        case "boolean": return false;

        case "user":
        case "role":

        case "channel":
        case "guild channel":
        case "dm channel":
        case "text channel":
        case "voice channel":
        case "category channel":
        case "news channel":
        case "store channel":
            return null;
    }
}