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
} from "./buildin";
import { InvalidRangeParseError } from "./errors";
import { Parser } from "./Parser";

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
    /** Parses an interger and checks the value is in range [min; max). */
    rangei: (min: number, max: number) =>
        INTEGER_PARSER.if(
            n => n >= min && n < max,
            n => new InvalidRangeParseError(n, min, max),
        ),
    /** Parses a float and checks the value is in range [min; max]. */
    rangef: (min: number, max: number) =>
        FLOAT_PARSER.if(
            n => n >= min && n <= max,
            n => new InvalidRangeParseError(n, min, max),
        ),
    /** Parses a string and checks the value is one of the values. */
    values: <T extends string = never>(...values: T[]): Parser<T> =>
        STRING_PARSER.if((s): s is T => values.includes(s as T)),
});
