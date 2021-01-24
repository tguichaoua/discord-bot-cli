import { ParsingContext } from "../ParsingContext";
import { Parser } from "../Parser";

export class StringParser extends Parser<string> {
    public get typeName() {
        return "$string$";
    }

    protected parse(context: ParsingContext): string {
        return context.nextString();
    }

    public length(minLength: number, _else?: string): this {
        return this.if(
            s => s.length >= minLength,
            _else ?? `require at least ${minLength} character${minLength > 1 ? "s" : ""}.`,
        );
    }

    public values(...values: string[]): this {
        return this.if(s => values.includes(s));
    }
}

abstract class NumberParser extends Parser<number> {
    public range(min: number, max: number): this {
        return this.if(n => min <= n && n <= max);
    }

    public min(min: number): this {
        return this.if(n => n >= min);
    }

    public max(max: number): this {
        return this.if(n => n <= max);
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
