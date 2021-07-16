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

/** @internal
 * ! The pattern should have a capturing group for the id
 */
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
            // Every pattern have a capturing group to capture the id
            id = idResult[1]!;
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
/** Parses a channel and checks its type is one of the provided. */
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
