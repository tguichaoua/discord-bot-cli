import { NotEnoughArgParseError } from "../errors";
import { Parser } from "../Parser";

export const STRING_PARSER = Parser.fromFunction("$string$", ctx => ctx.nextString());
export const INTEGER_PARSER = Parser.fromFunction("$integer$", ctx => ctx.nextInteger());
export const FLOAT_PARSER = Parser.fromFunction("$float$", ctx => ctx.nextFloat());
export const BOOLEAN_PARSER = Parser.fromFunction("$boolean$", ctx => ctx.nextBoolean());

export function restParser<T>(parser: Parser<T>): Parser<T[]> {
    return Parser.fromFunction(parser.typeName + "...", ctx => {
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
