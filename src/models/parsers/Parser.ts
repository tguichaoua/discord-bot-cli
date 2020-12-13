import { ParsingContext } from "./ParsingContext";
import { InvalidValueParseError } from "./errors";

export abstract class Parser<T> {
    private readonly conditions: {
        predicate: (o: T) => boolean;
        _else?: string;
    }[] = [];

    // public abstract get typeName(): string;
    // TODO: replace with abstract version.
    public get typeName(): string {
        return "$typename$";
    }

    protected abstract parse(context: ParsingContext): T;

    public if(predicate: (o: T) => boolean, _else?: string): this {
        this.conditions.push({ predicate, _else });
        return this;
    }

    /** @internal */
    public _parse(context: ParsingContext): T {
        const value = this.parse(context);
        for (const cond of this.conditions) if (!cond.predicate(value)) throw new InvalidValueParseError(cond._else);
        return value;
    }
}

export type ParserType<P extends Parser<any>> = P extends Parser<infer T> ? T : never;
