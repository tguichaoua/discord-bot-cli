import { ParsableDef } from "../def/ParsableDef";
import { ParsableType, ParsableTypeName, getDefaultValue } from "../ParsableType";
import { Message, MessageMentions } from "discord.js";

/** @ignore */
const ID_PATTERN = /^\d{17,21}$/;

/** @ignore */
export class Parsable {

    public readonly name: string;
    public readonly description?: string;
    public readonly type: ParsableTypeName;
    private _validator?: (o: any) => boolean;
    public readonly defaultValue: ParsableType;

    constructor(name: string, def: ParsableDef) {
        this.name = name;
        this.description = def.description;
        this.type = def.type;
        this._validator = def.validator;
        this.defaultValue = def.defaultValue ?? getDefaultValue(def.type);
    }

    parse(message: Message, argument: string): ParsableType | undefined {
        let value = undefined;

        function resolveChannel(type: keyof typeof ChannelType) {
            const ch = message.client.channels.resolve(argument);
            if (ch && ch.type === type)
                return ch;
            return undefined;
        }

        switch (this.type) {
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
                if (user) value = message.mentions.users.get(user[1]);
                else if (ID_PATTERN.test(argument)) value = message.client.users.resolve(argument) ?? undefined;
                break;

            case "role":
                const role = MessageMentions.ROLES_PATTERN.exec(argument);
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
                if (channel) value = message.mentions.channels.get(channel[1]);
                else if (ID_PATTERN.test(argument)) value = resolveChannel("text");
                break;
        }
        if (value !== undefined && (!this._validator || this._validator(value)))
            return value;
    }
}