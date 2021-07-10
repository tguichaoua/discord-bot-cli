import { Parser } from "../Parser";

export const STRING_PARSER = Parser.fromFunction("$string$", 1, ctx => ctx.nextString());
export const INTEGER_PARSER = Parser.fromFunction("$integer$", 1, ctx => ctx.nextInteger());
export const FLOAT_PARSER = Parser.fromFunction("$float$", 1, ctx => ctx.nextFloat());
export const BOOLEAN_PARSER = Parser.fromFunction("$boolean$", 1, ctx => ctx.nextBoolean());

export const REST_PARSER = Parser.fromFunction("$string$...", 0, ctx => ctx.rest());
