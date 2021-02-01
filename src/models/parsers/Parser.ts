import { ParsingContext } from "./ParsingContext";
import { InvalidValueParseError, NotEnoughArgParseError } from "./errors";
import { Predicate } from "../../utils/types";

type OnFail<T> = (value: T) => InvalidValueParseError;

export abstract class Parser<T> {
    private readonly conditions: {
        readonly predicate: Predicate<unknown>;
        readonly onFail?: OnFail<unknown>;
    }[] = [];

    constructor(public readonly typeName: string, public readonly minimalInputRequired: number) {}

    protected abstract parse(context: ParsingContext): T;

    public if(predicate: Predicate<T>, onFail?: OnFail<T>): this {
        this.conditions.push({ predicate: predicate as Predicate<unknown>, onFail: onFail as OnFail<unknown> });
        return this;
    }

    /** @internal */
    public _parse(context: ParsingContext): T {
        if (context.remaining < this.minimalInputRequired)
            throw new NotEnoughArgParseError(this.minimalInputRequired, context.remaining);

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

export type ParserType<P extends Parser<unknown>> = P extends Parser<infer T> ? T : never;
