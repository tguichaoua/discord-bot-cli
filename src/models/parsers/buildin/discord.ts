import {
    CategoryChannel,
    Channel,
    DMChannel,
    MessageMentions,
    NewsChannel,
    Role,
    StoreChannel,
    TextChannel,
    User,
    VoiceChannel,
} from "discord.js";
import { distinct } from "../../../utils/array";
import {
    SnowflakeParseError,
    UnresolvedChannelParseError,
    UnresolvedRoleParseError,
    UnresolvedUserParseError,
    WrongTypeChannelParseError,
} from "../errors/discord";
import { Parser } from "../Parser";
import { ParsingContext } from "../ParsingContext";

/** @internal */
const ID_PATTERN = /^\d{17,21}$/;

export class UserParser extends Parser<User> {
    constructor() {
        super("$user$", 1);
    }

    protected parse(context: ParsingContext): User {
        const str = context.nextString();
        const idResult = MessageMentions.USERS_PATTERN.exec(str);
        MessageMentions.USERS_PATTERN.lastIndex = 0;

        let id: string | undefined = undefined;
        let user: User | undefined;
        if (idResult) {
            id = idResult[1];
            user = context.message.mentions.users.get(id);
        } else if (ID_PATTERN.test(str)) {
            id = str;
            user = context.message.client.users.resolve(str) ?? undefined;
        }

        if (user) return user;
        if (id) throw new UnresolvedUserParseError(id);
        throw new SnowflakeParseError(str);
    }
}

export class RoleParser extends Parser<Role> {
    constructor() {
        super("$role$", 1);
    }

    protected parse(context: ParsingContext): Role {
        const str = context.nextString();
        const roleResult = MessageMentions.ROLES_PATTERN.exec(str);
        MessageMentions.ROLES_PATTERN.lastIndex = 0;

        let id: string | undefined = undefined;
        let role: Role | undefined;
        if (roleResult) {
            id = roleResult[1];
            role = context.message.mentions.roles.get(id);
        } else if (ID_PATTERN.test(str)) {
            id = str;
            role = context.message.guild?.roles?.resolve(id) ?? undefined;
        }

        if (role) return role;
        if (id) throw new UnresolvedRoleParseError(id);
        throw new SnowflakeParseError(str);
    }
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

export class ChannelParser<T extends Channel> extends Parser<T> {
    private constructor(typeName: string) {
        super(typeName, 1);
    }

    public static of(): ChannelParser<Channel>;
    public static of<Type extends Exclude<Channel["type"], "unknown" | "group">>(
        ...types: Type[]
    ): ChannelParser<Type2Channel<Type>>;
    public static of(...types: Exclude<Channel["type"], "unknown" | "group">[]): ChannelParser<Channel> {
        types = distinct(types);
        const isChannel = types.length === 0;
        const parser = new ChannelParser(isChannel ? "$channel$" : types.map(t => `$${t} channel$`).join(" | "));

        if (!isChannel)
            parser.if(
                c => types.includes(c.type as Exclude<Channel["type"], "unknown" | "group">),
                c => new WrongTypeChannelParseError(c, types),
            );

        return parser;
    }

    protected parse(context: ParsingContext): T {
        const str = context.nextString();
        const channelResult = MessageMentions.CHANNELS_PATTERN.exec(str);
        MessageMentions.CHANNELS_PATTERN.lastIndex = 0;

        let id: string | undefined = undefined;
        let channel: Channel | undefined;
        if (channelResult) {
            id = channelResult[1];
            channel = context.message.mentions.channels.get(id);
        } else if (ID_PATTERN.test(str)) {
            id = str;
            channel = context.message.client.channels.resolve(id) ?? undefined;
        }

        if (channel) return channel as T;
        if (id) throw new UnresolvedChannelParseError(id);
        throw new SnowflakeParseError(str);
    }
}
