import {
    CategoryChannel,
    Channel,
    Collection,
    DMChannel,
    Message,
    MessageMentions,
    NewsChannel,
    StoreChannel,
    TextChannel,
    VoiceChannel,
} from "discord.js";
import { distinct } from "../../../utils/array";
import {
    SnowflakeParseError,
    UnresolvedChannelParseError,
    UnresolvedObjectParserError,
    UnresolvedRoleParseError,
    UnresolvedUserParseError,
    WrongTypeChannelParseError,
} from "../errors/discord";
import { Parser } from "../Parser";
import { ParsingContext } from "../ParsingContext";

/** @internal */
const ID_PATTERN = /^\d{17,21}$/;
/** @internal */
const USERS_PATTERN = /^<@!?(\d{17,19})>$/; // <@81440962496172032>
/** @internal */
const ROLES_PATTERN = /^<@&(\d{17,19})>$/; // <@&297577916114403338>
/** @internal */
const CHANNELS_PATTERN = /^<#(\d{17,19})>$/; // <#222079895583457280>

/** @internal */
function discordParser<T>(
    pattern: RegExp,
    mentionToCollection: (m: MessageMentions) => Collection<string, T>,
    resolve: (m: Message, id: string) => T | undefined,
    parserError: new (id: string) => UnresolvedObjectParserError,
): (ctx: ParsingContext) => T {
    return context => {
        const str = context.nextString();
        const idResult = str.match(pattern);

        let id: string | undefined;
        let obj: T | undefined;
        if (idResult) {
            id = idResult[1];
            obj = mentionToCollection(context.message.mentions).get(id);
        } else if (ID_PATTERN.test(str)) {
            obj = resolve(context.message, str);
        }

        if (obj) return obj;
        if (id) throw new parserError(id);
        throw new SnowflakeParseError(str);
    };
}

export const USER_PARSER = Parser.fromFunction(
    "$user$",
    1,
    discordParser(
        USERS_PATTERN,
        m => m.users,
        (m, id) => m.client.users.resolve(id) ?? undefined,
        UnresolvedUserParseError,
    ),
);

export const ROLE_PARSER = Parser.fromFunction(
    "$role$",
    1,
    discordParser(
        ROLES_PATTERN,
        m => m.roles,
        (m, id) => m.guild?.roles?.resolve(id) ?? undefined,
        UnresolvedRoleParseError,
    ),
);

/** @internal */
const CHANNEL_PARSER_FC = discordParser(
    CHANNELS_PATTERN,
    m => m.channels,
    (m, id) => m.client.channels.resolve(id) ?? undefined,
    UnresolvedChannelParseError,
);

export const CHANNEL_PARSER = Parser.fromFunction("$channel$", 1, CHANNEL_PARSER_FC);

export function channelParser(): Parser<Channel>;
export function channelParser<Type extends Exclude<Channel["type"], "unknown" | "group">>(
    ...types: Type[]
): Parser<Type2Channel<Type>>;
export function channelParser<Type extends Exclude<Channel["type"], "unknown" | "group">>(
    ...types: Type[]
): Parser<Channel> {
    if (types.length === 0) return CHANNEL_PARSER;

    types = distinct(types).sort();
    const typeName = types.map(t => `$${t} channel$`).join(" | ");

    return Parser.fromFunction(typeName, 1, CHANNEL_PARSER_FC).if(
        (c): c is Type2Channel<Type> => types.includes(c.type as Type),
        c => new WrongTypeChannelParseError(c, types),
    );
}

type Type2Channel<Type extends Channel["type"]> = Type extends "text"
    ? TextChannel
    : Type extends "dm"
    ? DMChannel
    : Type extends "voice"
    ? VoiceChannel
    : Type extends "category"
    ? CategoryChannel
    : Type extends "news"
    ? NewsChannel
    : Type extends "store"
    ? StoreChannel
    : Type extends "unknown"
    ? Channel
    : never;

// export class UserParser extends CustomParser<User> {
//     constructor() {
//         super("$user$", 1);
//     }

//     public parse(context: ParsingContext): User {
//         const str = context.nextString();
//         const idResult = str.match(USERS_PATTERN);

//         let id: string | undefined = undefined;
//         let user: User | undefined;
//         if (idResult) {
//             id = idResult[1];
//             user = context.message.mentions.users.get(id);
//         } else if (ID_PATTERN.test(str)) {
//             id = str;
//             user = context.message.client.users.resolve(str) ?? undefined;
//         }

//         if (user) return user;
//         if (id) throw new UnresolvedUserParseError(id);
//         throw new SnowflakeParseError(str);
//     }
// }

// export class RoleParser extends CustomParser<Role> {
//     constructor() {
//         super("$role$", 1);
//     }

//     public parse(context: ParsingContext): Role {
//         const str = context.nextString();
//         const roleResult = str.match(ROLES_PATTERN);

//         let id: string | undefined = undefined;
//         let role: Role | undefined;
//         if (roleResult) {
//             id = roleResult[1];
//             role = context.message.mentions.roles.get(id);
//         } else if (ID_PATTERN.test(str)) {
//             id = str;
//             role = context.message.guild?.roles?.resolve(id) ?? undefined;
//         }

//         if (role) return role;
//         if (id) throw new UnresolvedRoleParseError(id);
//         throw new SnowflakeParseError(str);
//     }
// }

// export class ChannelParser<T extends Channel> extends CustomParser<T> {
//     private constructor(typeName: string) {
//         super(typeName, 1);
//     }

//     public static of(): ChannelParser<Channel>;
//     public static of<Type extends Exclude<Channel["type"], "unknown" | "group">>(
//         ...types: Type[]
//     ): ChannelParser<Type2Channel<Type>>;
//     public static of(...types: Exclude<Channel["type"], "unknown" | "group">[]): ChannelParser<Channel> {
//         types = distinct(types);
//         const isChannel = types.length === 0;
//         const parser = new ChannelParser(isChannel ? "$channel$" : types.map(t => `$${t} channel$`).join(" | "));

//         if (!isChannel)
//             parser.if(
//                 c => types.includes(c.type as Exclude<Channel["type"], "unknown" | "group">),
//                 c => new WrongTypeChannelParseError(c, types),
//             );

//         return parser;
//     }

//     public parse(context: ParsingContext): T {
//         const str = context.nextString();
//         const channelResult = str.match(CHANNELS_PATTERN);

//         let id: string | undefined = undefined;
//         let channel: Channel | undefined;
//         if (channelResult) {
//             id = channelResult[1];
//             channel = context.message.mentions.channels.get(id);
//         } else if (ID_PATTERN.test(str)) {
//             id = str;
//             channel = context.message.client.channels.resolve(id) ?? undefined;
//         }

//         if (channel) return channel as T;
//         if (id) throw new UnresolvedChannelParseError(id);
//         throw new SnowflakeParseError(str);
//     }
// }
