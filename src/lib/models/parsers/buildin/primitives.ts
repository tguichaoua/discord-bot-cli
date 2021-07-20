import { NotEnoughArgParseError } from "../errors";
import { Parser } from "../Parser";

export const STRING_PARSER = Parser.fromFunction("$string$", 1, ctx => ctx.nextString());
export const INTEGER_PARSER = Parser.fromFunction("$integer$", 1, ctx => ctx.nextInteger());
export const FLOAT_PARSER = Parser.fromFunction("$float$", 1, ctx => ctx.nextFloat());
export const BOOLEAN_PARSER = Parser.fromFunction("$boolean$", 1, ctx => ctx.nextBoolean());

export function restParser<T>(parser: Parser<T>): Parser<T[]> {
    return Parser.fromFunction(parser.typeName + "...", 0, ctx => {
        const rest: T[] = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                rest.push(parser.parse(ctx));
            } catch (e) {
                if (e instanceof NotEnoughArgParseError) return rest;
                throw e;
            }
        }
    });
}
