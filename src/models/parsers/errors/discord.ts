import { Channel } from "discord.js";
import { InvalidTypeParseError, InvalidValueParseError } from "./base";

export class UnresolvedObjectParserError extends InvalidValueParseError {
    constructor(typename: string, public readonly id: string) {
        super(`Cannot resolve ${typename} with this id: ${id}`);
        this.name = "UnresolvedObjectParserError";
    }
}

export class UnresolvedUserParseError extends UnresolvedObjectParserError {
    constructor(id: string) {
        super("user", id);
        this.name = "UnresolvedUserParseError";
    }
}

export class UnresolvedRoleParseError extends UnresolvedObjectParserError {
    constructor(id: string) {
        super("role", id);
        this.name = "UnresolvedRoleParseError";
    }
}

export class UnresolvedChannelParseError extends UnresolvedObjectParserError {
    constructor(id: string) {
        super("channel", id);
        this.name = "UnresolvedChannelParseError";
    }
}

export class SnowflakeParseError extends InvalidTypeParseError {
    constructor(got: string) {
        super("Snowflake", got);
        this.name = "SnowflakeParseError";
    }
}

export class WrongTypeChannelParseError extends InvalidValueParseError {
    constructor(public readonly channel: Channel, public readonly expectedTypes: readonly Channel["type"][]) {
        super(
            `Got a channel of type ${channel.type} but expected one of the following types: ${expectedTypes.join(
                ", ",
            )}`,
        );
        this.name = "WrongTypeChannelParseError";
    }
}
