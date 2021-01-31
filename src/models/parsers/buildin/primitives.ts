import { ParsingContext } from "../ParsingContext";
import { Parser } from "../Parser";
import { InvalidMaxValueParseError, InvalidMinValueParseError, InvalidRangeParseError } from "../errors";
import { InvalidStringLengthParseError, InvalidStringValueParseError } from "../errors/string";

export class StringParser extends Parser<string> {
    public get typeName() {
        return "$string$";
    }

    protected parse(context: ParsingContext): string {
        return context.nextString();
    }

    public length(minLength: number): this {
        return this.if(
            s => s.length >= minLength,
            s => new InvalidStringLengthParseError(s, minLength),
        );
    }

    public values(...values: readonly string[]): this {
        return this.if(
            s => values.includes(s),
            s => new InvalidStringValueParseError(s, values),
        );
    }
}

abstract class NumberParser extends Parser<number> {
    public range(min: number, max: number): this {
        return this.if(
            n => min <= n && n <= max,
            n => new InvalidRangeParseError(n, min, max),
        );
    }

    public min(min: number): this {
        return this.if(
            n => n >= min,
            n => new InvalidMinValueParseError(n, min),
        );
    }

    public max(max: number): this {
        return this.if(
            n => n <= max,
            n => new InvalidMaxValueParseError(n, max),
        );
    }
}

export class IntegerParser extends NumberParser {
    public get typeName() {
        return "$integer$";
    }

    protected parse(context: ParsingContext): number {
        return context.nextInteger();
    }
}

export class FloatParser extends NumberParser {
    public get typeName() {
        return "$float$";
    }

    protected parse(context: ParsingContext): number {
        return context.nextFloat();
    }
}

export class BooleanParser extends Parser<boolean> {
    public get typeName() {
        return "$boolean$";
    }

    protected parse(context: ParsingContext): boolean {
        return context.nextBoolean();
    }
}
