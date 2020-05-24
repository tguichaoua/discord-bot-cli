import { Message, MessageMentions } from "discord.js";
import { ParsableType } from "../models/ParsableType";
import { ParsableDefinition } from "../models/definition/ParsableDefinition";

/** @internal */
const ID_PATTERN = /^\d{17,21}$/;

/** @internal 
 * Return undefined if parse fail.
*/
export function parse(parseData: ParsableDefinition, message: Message, argument: string): ParsableType | undefined {
    let value = undefined;

    function resolveChannel(type: keyof typeof ChannelType) {
        const ch = message.client.channels.resolve(argument);
        if (ch && ch.type === type)
            return ch;
        return undefined;
    }

    switch (parseData.type) {
        case "string":
            value = argument;
            break;
        case "integer":
            value = parseInt(argument);
            break;
        case "float":
            value = parseFloat(argument);
            break;
        case "boolean":
            switch (argument.toLocaleLowerCase()) {
                case "true":
                case "1":
                    value = true;
                    break;
                case "false":
                case "0":
                    value = false;
                    break;
            }
            break;

        case "user":
            const user = MessageMentions.USERS_PATTERN.exec(argument);
            MessageMentions.USERS_PATTERN.lastIndex = 0;
            if (user) value = message.mentions.users.get(user[1]);
            else if (ID_PATTERN.test(argument)) value = message.client.users.resolve(argument) ?? undefined;
            break;

        case "role":
            const role = MessageMentions.ROLES_PATTERN.exec(argument);
            MessageMentions.ROLES_PATTERN.lastIndex = 0;
            if (role) value = message.mentions.roles.get(role[1]);
            else if (ID_PATTERN.test(argument)) value = message.guild?.roles?.resolve(argument) ?? undefined;
            break;

        case "channel":
            if (ID_PATTERN.test(argument)) value = message.client.channels.resolve(argument) ?? undefined;
            break;

        case "guild channel":
            if (ID_PATTERN.test(argument)) {
                const ch = message.client.channels.resolve(argument);
                if (ch && ch.type !== "dm" && ch.type !== "unknown" && ch.type !== "group")
                    value = ch;
            }
            break;

        case "dm channel":
            if (ID_PATTERN.test(argument)) value = resolveChannel("dm");
            break;

        case "voice channel":
            if (ID_PATTERN.test(argument)) value = resolveChannel("voice");
            break;

        case "category channel":
            if (ID_PATTERN.test(argument)) value = resolveChannel("category");
            break;

        case "news channel":
            if (ID_PATTERN.test(argument)) value = resolveChannel("news");
            break;

        case "store channel":
            if (ID_PATTERN.test(argument)) value = resolveChannel("store");
            break;

        case "text channel":
            const channel = MessageMentions.CHANNELS_PATTERN.exec(argument);
            MessageMentions.CHANNELS_PATTERN.lastIndex = 0;
            if (channel) value = message.mentions.channels.get(channel[1]);
            else if (ID_PATTERN.test(argument)) value = resolveChannel("text");
            break;
    }
    if (value !== undefined && (!parseData.validator || (parseData.validator as (o: any) => boolean)(value)))
        return value;
}