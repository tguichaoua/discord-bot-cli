import { InvalidRangeParseError } from "../errors";
import { Parser } from "../Parser";

export const STRING_PARSER = Parser.fromFunction("$string$", ctx => ctx.nextString());
export const INTEGER_PARSER = Parser.fromFunction("$integer$", ctx => ctx.nextInteger());
export const FLOAT_PARSER = Parser.fromFunction("$float$", ctx => ctx.nextFloat());
export const BOOLEAN_PARSER = Parser.fromFunction("$boolean$", ctx => ctx.nextBoolean());

/**
 * Parses a string and checks the value is one of the expected.
 * @param values The expected values
 */
export function values<T extends string = never>(...values: T[]) {
    return STRING_PARSER.if((s): s is T => values.includes(s as T));
}

/**
 * Parses an interger and checks the value is in range [min; max).
 *
 * Raise `InvalidRangeParseError` if the value is not in the range.
 * @param min The minimum value expected (included)
 * @param max The maximum value expected (excluded)
 */
export function rangei(min: number, max: number) {
    return INTEGER_PARSER.if(
        n => n >= min && n < max,
        n => new InvalidRangeParseError(n, min, max),
    );
}

/**
 * Parses a float and checks the value is in range [min; max].
 *
 * Raise `InvalidRangeParseError` if the value is not in the range.
 * @param min The minimum value expected (included)
 * @param max The maximum value expected (included)
 */
export function rangef(min: number, max: number) {
    return FLOAT_PARSER.if(
        n => n >= min && n <= max,
        n => new InvalidRangeParseError(n, min, max),
    );
}
