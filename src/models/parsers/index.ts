import {
    BOOLEAN_PARSER,
    channelParser,
    FLOAT_PARSER,
    INTEGER_PARSER,
    REST_PARSER,
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
    get string() {
        return STRING_PARSER;
    },
    get integer() {
        return INTEGER_PARSER;
    },
    get float() {
        return FLOAT_PARSER;
    },
    get boolean() {
        return BOOLEAN_PARSER;
    },
    get rest() {
        return REST_PARSER;
    },
    get user() {
        return USER_PARSER;
    },
    get role() {
        return ROLE_PARSER;
    },
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
