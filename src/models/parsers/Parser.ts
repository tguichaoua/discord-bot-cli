import { ParsingContext } from "./ParsingContext";
import { InvalidValueParseError } from "./errors";

export abstract class Parser<T> {
    private readonly conditions: {
        readonly predicate: (o: T) => boolean;
        readonly _else?: string;
    }[] = [];

    public abstract get typeName(): string;

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

    /** @internal */
    public _getLocalizedTypeName(localization: Record<string, string>): string {
        return this.typeName.replace(/\$(.*?)\$/g, (_, typename) => localization[typename] ?? typename);
    }
}

export type ParserType<P extends Parser<any>> = P extends Parser<infer T> ? T : never;
