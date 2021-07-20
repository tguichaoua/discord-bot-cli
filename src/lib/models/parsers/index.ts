import {
    BOOLEAN_PARSER,
    STRING_PARSER,
    INTEGER_PARSER,
    FLOAT_PARSER,
    UnionParser,
    RestParser,
    USER_PARSER,
    ROLE_PARSER,
    channelParser,
    values,
    rangei,
    rangef,
} from "./buildin";

export * from "./Parser";
export * from "./ParsingContext";
export * from "./buildin";
export * from "./errors";

export const Parsers = Object.freeze({
    string: STRING_PARSER,
    integer: INTEGER_PARSER,
    float: FLOAT_PARSER,
    boolean: BOOLEAN_PARSER,
    rest: RestParser.create,
    union: UnionParser.create,
    user: USER_PARSER,
    role: ROLE_PARSER,
    channel: channelParser,
    values,
    rangei,
    rangef,
});
