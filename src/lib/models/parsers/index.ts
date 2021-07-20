import {
    BOOLEAN_PARSER,
    channelParser,
    FLOAT_PARSER,
    INTEGER_PARSER,
    restParser,
    ROLE_PARSER,
    STRING_PARSER,
    UnionParser,
    USER_PARSER,
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
    rest: restParser,
    user: USER_PARSER,
    role: ROLE_PARSER,
    channel: channelParser,
    /** Parses the value using each parser **in order** until the first that successfully parse the value.*/
    union: <T extends Parser<unknown>[] = Parser<unknown>[]>(...parsers: T) => {
        return new UnionParser(...parsers);
    },
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
