import { Parser } from "../Parser";

export const STRING_PARSER = Parser.fromFunction("$string$", ctx => ctx.nextString());
export const INTEGER_PARSER = Parser.fromFunction("$integer$", ctx => ctx.nextInteger());
export const FLOAT_PARSER = Parser.fromFunction("$float$", ctx => ctx.nextFloat());
export const BOOLEAN_PARSER = Parser.fromFunction("$boolean$", ctx => ctx.nextBoolean());
