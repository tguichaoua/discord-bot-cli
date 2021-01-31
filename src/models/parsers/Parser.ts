import { ParsingContext } from "./ParsingContext";
import { InvalidValueParseError } from "./errors";

type OnFail<T> = (value: T) => InvalidValueParseError;

export abstract class Parser<T> {
    private readonly conditions: {
        readonly predicate: (value: T) => boolean;
        readonly onFail?: OnFail<T>;
    }[] = [];

    public abstract get typeName(): string;

    protected abstract parse(context: ParsingContext): T;

    public if(predicate: (value: T) => boolean, onFail?: OnFail<T>): this {
        this.conditions.push({ predicate, onFail });
        return this;
    }

    /** @internal */
    public _parse(context: ParsingContext): T {
        const value = this.parse(context);
        for (const cond of this.conditions)
            if (!cond.predicate(value)) throw cond.onFail ? cond.onFail(value) : new InvalidValueParseError();
        return value;
    }

    /** @internal */
    public _getLocalizedTypeName(localization: Record<string, string>): string {
        return this.typeName.replace(/\$(.*?)\$/g, (_, typename) => localization[typename] ?? typename);
    }
}

export type ParserType<P extends Parser<any>> = P extends Parser<infer T> ? T : never;
