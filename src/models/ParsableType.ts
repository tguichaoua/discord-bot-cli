import { User, TextChannel, Channel, GuildChannel, DMChannel, VoiceChannel, CategoryChannel, NewsChannel, StoreChannel, Role } from "discord.js";

export type ParsableTypeName = "string" | "boolean" | "integer" | "float" |
    "user" | "role" |
    "channel" | "guild channel" | "dm channel" | "text channel" | "voice channel" | "category channel" | "news channel" | "store channel";

export type ParsableType = string | boolean | number |
    User | Role |
    Channel | GuildChannel | DMChannel | TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel;

export type ParsableTypeOf<Names extends ParsableTypeName | readonly ParsableTypeName[]> =
    Names extends ParsableTypeName ? TypeName2Type<Names> : TypeName2Type<Exclude<Names, ParsableTypeName>[number]>;

type TypeName2Type<Name extends ParsableTypeName> =
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
