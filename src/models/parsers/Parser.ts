import { ParsingContext } from "./ParsingContext";
import { InvalidValueParseError, NotEnoughArgParseError } from "./errors";
import { Predicate, TypeGuard } from "../../utils/types";

type OnFail<T> = (value: T) => InvalidValueParseError;

export type ParserType<P extends Parser<unknown>> = P extends Parser<infer T> ? T : never;

export abstract class Parser<T> {
    public abstract get typeName(): string;

    public abstract get minimalInputRequired(): number;

    public abstract parse(context: ParsingContext): T;

    public if<To extends T>(predicate: TypeGuard<T, To>, onFail?: OnFail<T>): Parser<To>;
    public if(predicate: Predicate<T>, onFail?: OnFail<T>): Parser<T>;
    public if<To>(predicate: Predicate<T>, onFail?: OnFail<T>): Parser<T | To> {
        return new IfParser(this, predicate, onFail);
    }

    public map<U>(map: (o: T) => U): Parser<U> {
        return new MapParser(this, map);
    }

    /** @internal */
    public _parse(context: ParsingContext): T {
        if (context.remaining < this.minimalInputRequired)
            throw new NotEnoughArgParseError(this.minimalInputRequired, context.remaining);

        return this.parse(context);
    }

    /** @internal */
    public _getLocalizedTypeName(localization: Record<string, string>): string {
        return this.typeName.replace(/\$(.*?)\$/g, (_, typename) => localization[typename] ?? typename);
    }

    public static fromFunction<T>(
        typeName: string,
        minimalInputRequired: number,
        parser: (ctx: ParsingContext) => T,
    ): Parser<T> {
        return new FunctionParser(typeName, minimalInputRequired, parser);
    }
}

export abstract class CustomParser<T> extends Parser<T> {
    constructor(private readonly _typeName: string, private readonly _minimalInputRequired: number) {
        super();
    }

    get typeName() {
        return this._typeName;
    }

    get minimalInputRequired() {
        return this._minimalInputRequired;
    }
}

class FunctionParser<T> extends CustomParser<T> {
    constructor(typeName: string, minimalInputRequired: number, public readonly parse: (ctx: ParsingContext) => T) {
        super(typeName, minimalInputRequired);
    }
}

abstract class WrapperParser<I, O = I> extends Parser<O> {
    constructor(public readonly inner: Parser<I>) {
        super();
    }

    public get typeName() {
        return this.inner.typeName;
    }

    public get minimalInputRequired() {
        return this.inner.minimalInputRequired;
    }
}

class IfParser<T> extends WrapperParser<T> {
    constructor(inner: Parser<T>, private readonly predicate: Predicate<T>, private readonly onFail?: OnFail<T>) {
        super(inner);
    }

    public parse(context: ParsingContext): T {
        const value = this.inner.parse(context);
        if (!this.predicate(value)) throw this.onFail ? this.onFail(value) : new InvalidValueParseError();
        return value;
    }
}

class MapParser<I, O> extends WrapperParser<I, O> {
    constructor(inner: Parser<I>, private readonly _map: (o: I) => O) {
        super(inner);
    }

    public parse(context: ParsingContext): O {
        const value = this.inner.parse(context);
        return this._map(value);
    }
}
