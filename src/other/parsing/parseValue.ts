import { Message, MessageMentions } from "discord.js";
import { ParsableType } from "../../models/ParsableType";
import { ParsableDefinition } from "../../models/definition/ParsableDefinition";
import { isArray } from "../../utils/array";

/** @internal */
const ID_PATTERN = /^\d{17,21}$/;

/** @internal
 * Return undefined if parse fail.
 */
export function parseValue(
    parseData: ParsableDefinition,
    message: Message,
    argument: string,
): { value: ParsableType | undefined; message?: string } {
    let value: ParsableType | undefined;
    if (isArray(parseData.type)) {
        for (const t of parseData.type) {
            value = parse(t, argument, message);
            if (value !== undefined) break;
        }
    } else {
        value = parse(parseData.type, argument, message);
    }

    if (value === undefined) return { value: undefined };
    const validation = parseData.validator
        ? (parseData.validator as (o: unknown) => boolean | string)(value)
        : undefined;

    if (validation === true || validation === undefined) return { value };
    return {
        value: undefined,
        message: typeof validation === "string" ? validation : undefined,
    };
}

/** @internal */
function parse(type: ParsableType, str: string, message: Message): ParsableType | undefined {
    function resolveChannel(type: keyof typeof ChannelType) {
        const ch = message.client.channels.resolve(str);
        if (ch && ch.type === type) return ch;
        return undefined;
    }

    switch (type) {
        case "string":
            return str;
        case "integer": {
            const i = parseInt(str);
            return isNaN(i) ? undefined : i;
        }
        case "float": {
            const f = parseFloat(str);
            return isNaN(f) ? undefined : f;
        }
        case "boolean":
            switch (str.toLocaleLowerCase()) {
                case "true":
                    return true;
                case "false":
                    return false;
            }
            break;

        case "user": {
            const user = MessageMentions.USERS_PATTERN.exec(str);
            MessageMentions.USERS_PATTERN.lastIndex = 0;
            if (user) return message.mentions.users.get(user[1]);
            else if (ID_PATTERN.test(str)) return message.client.users.resolve(str) ?? undefined;
            else return undefined;
        }

        case "role": {
            const role = MessageMentions.ROLES_PATTERN.exec(str);
            MessageMentions.ROLES_PATTERN.lastIndex = 0;
            if (role) return message.mentions.roles.get(role[1]);
            else if (ID_PATTERN.test(str)) return message.guild?.roles?.resolve(str) ?? undefined;
            else return undefined;
        }

        case "channel":
            if (ID_PATTERN.test(str)) return message.client.channels.resolve(str) ?? undefined;
            else return undefined;

        case "guild channel":
            if (ID_PATTERN.test(str)) {
                const ch = message.client.channels.resolve(str);
                if (ch && ch.type !== "dm" && ch.type !== "unknown" && ch.type !== "group") return ch;
            }
            return undefined;

        case "dm channel":
            if (ID_PATTERN.test(str)) return resolveChannel("dm");
            return undefined;

        case "voice channel":
            if (ID_PATTERN.test(str)) return resolveChannel("voice");
            return undefined;

        case "category channel":
            if (ID_PATTERN.test(str)) return resolveChannel("category");
            return undefined;

        case "news channel":
            if (ID_PATTERN.test(str)) return resolveChannel("news");
            return undefined;

        case "store channel":
            if (ID_PATTERN.test(str)) return resolveChannel("store");
            return undefined;

        case "text channel": {
            const channel = MessageMentions.CHANNELS_PATTERN.exec(str);
            MessageMentions.CHANNELS_PATTERN.lastIndex = 0;
            if (channel) return message.mentions.channels.get(channel[1]);
            else if (ID_PATTERN.test(str)) return resolveChannel("text");
        }
    }
}
