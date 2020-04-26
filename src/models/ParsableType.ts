import { User, TextChannel } from "discord.js";

export type ParsableTypeName = "string" | "boolean" | "integer" | "float" | "user" | "channel";
export type ParsableType = null | string | boolean | number | User | TextChannel;
export type ParsableTypeOf<Name extends ParsableTypeName> =
    Name extends "string" ? string :
    Name extends "boolean" ? boolean :
    Name extends "integer" ? number :
    Name extends "float" ? number :
    Name extends "user" ? User :
    Name extends "channel" ? TextChannel :
    never;

export function getDefaultValue(name: ParsableTypeName): ParsableType {
    switch (name) {
        case "string": return "";
        case "integer": case "float": return 0;
        case "boolean": return false;
        case "user": case "channel": return null;
    }
}