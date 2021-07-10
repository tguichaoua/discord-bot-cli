import { Parser } from "../Parser";

export const STRING_PARSER = Parser.fromFunction("$string$", 1, ctx => ctx.nextString());
export const INTEGER_PARSER = Parser.fromFunction("$integer$", 1, ctx => ctx.nextInteger());
export const FLOAT_PARSER = Parser.fromFunction("$float$", 1, ctx => ctx.nextFloat());
export const BOOLEAN_PARSER = Parser.fromFunction("$boolean$", 1, ctx => ctx.nextBoolean());

export const REST_PARSER = Parser.fromFunction("$string$...", 0, ctx => ctx.rest());

// export class StringParser extends CustomParser<string> {
//     constructor() {
//         super("$string$", 1);
//     }

//     public parse(context: ParsingContext): string {
//         return context.nextString();
//     }

//     public length(minLength: number): Parser<string> {
//         return this.if(
//             s => s.length >= minLength,
//             s => new InvalidStringLengthParseError(s, minLength),
//         );
//     }

//     public values(...values: readonly string[]): Parser<string> {
//         return this.if(
//             s => values.includes(s),
//             s => new InvalidStringValueParseError(s, values),
//         );
//     }
// }

// abstract class NumberParser extends CustomParser<number> {
//     public range(min: number, max: number): Parser<number> {
//         return this.if(
//             n => min <= n && n <= max,
//             n => new InvalidRangeParseError(n, min, max),
//         );
//     }

//     public min(min: number): Parser<number> {
//         return this.if(
//             n => n >= min,
//             n => new InvalidMinValueParseError(n, min),
//         );
//     }

//     public max(max: number): Parser<number> {
//         return this.if(
//             n => n <= max,
//             n => new InvalidMaxValueParseError(n, max),
//         );
//     }
// }

// export class IntegerParser extends NumberParser {
//     constructor() {
//         super("$integer$", 1);
//     }

//     public parse(context: ParsingContext): number {
//         return context.nextInteger();
//     }
// }

// export class FloatParser extends NumberParser {
//     constructor() {
//         super("$float$", 1);
//     }

//     public parse(context: ParsingContext): number {
//         return context.nextFloat();
//     }
// }

// export class BooleanParser extends CustomParser<boolean> {
//     constructor() {
//         super("$boolean$", 1);
//     }

//     public parse(context: ParsingContext): boolean {
//         return context.nextBoolean();
//     }
// }
