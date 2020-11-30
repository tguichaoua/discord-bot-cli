import { ArgProvider } from "../ArgProvider";
import { Parser } from "../Parser";

export class StringParser extends Parser<string> {
    protected parse(provider: ArgProvider): string {
        return provider.nextString();
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
    protected parse(provider: ArgProvider): number {
        return provider.nextInteger();
    }
}

export class FloatParser extends NumberParser {
    protected parse(provider: ArgProvider): number {
        return provider.nextFloat();
    }
}

export class BooleanParser extends Parser<boolean> {
    protected parse(provider: ArgProvider): boolean {
        return provider.nextBoolean();
    }
}
