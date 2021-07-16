import { ParsingContext } from "./ParsingContext";
import { InvalidValueParseError, NotEnoughArgParseError } from "./errors";
import { Predicate, TypeGuard } from "../../utils/types";

type OnFail<T> = (value: T) => InvalidValueParseError;

export type ParserType<P extends Parser<unknown>> = P extends Parser<infer T> ? T : never;

export abstract class Parser<T> {
    public abstract get typeName(): string;

    /** The minimum number of argument required by this parser. */
    public abstract get minimalInputRequired(): number;

    /**
     * Parses next inputs into a value.
     * @param context The parsing context
     */
    public abstract parse(context: ParsingContext): T;

    /**
     * Checks if the value pass the type guard or throws the error returns by onFail.
     * @param predicate The type guard the value must pass
     * @param onFail An error provider
     */
    public if<To extends T>(predicate: TypeGuard<T, To>, onFail?: OnFail<T>): Parser<To>;

    /**
     * Checks if the value pass the predicate or throws the error returns by onFail.
     * @param predicate The predicate the value must pass
     * @param onFail An error provider
     */
    public if(predicate: Predicate<T>, onFail?: OnFail<T>): Parser<T>;
    public if<To>(predicate: Predicate<T>, onFail?: OnFail<T>): Parser<T | To> {
        return new IfParser(this, predicate, onFail);
    }

    /**
     * Apply the map function on the parsed value.
     * @param map A function that take the parsed value and return another value
     */
    public map<U>(map: (o: T) => U): Parser<U> {
        return new MapParser(this, map);
    }

    /**
     * Converts the value into an object with a field `variant` with the litteral value of the
     * parameter variant and a field with the parsed value.
     * This mecanisme is designed to used with `Parsers.union` to help to determins what is the
     * type of the value (see example).
     * @param variant The value used for the variant field of the returned object
     *
     * @example
     * // In Command Definition
     * args: {
     *     dest: {
     *             parser: Parsers.union(
     *                 Parsers.user.discriminate("user"),
     *                 Parsers.channel().discriminate("channel")
     *             );
     *      }
     * }
     *
     * // In the command executor
     * switch(dest.variant) {
     *     case "user":
     *         await dest.value.send(`Hello ${dest.value.username}`);
     *         break;
     *     case "channel":
     *         await dest.value.send("Hello there !");
     *        break;
     * }
     */
    public discriminate<V extends string | number>(variant: V) {
        return this.map(value => {
            return { variant, value };
        });
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

    /**
     * Creates a parser from a function.
     * @param typeName The type name of the parser
     * @param minimalInputRequired The minimal number of argument required by the parser
     * @param parser The function used to parse the inputs into a value
     */
    public static fromFunction<T>(
        typeName: string,
        minimalInputRequired: number,
        parser: (ctx: ParsingContext) => T,
    ): Parser<T> {
        return new FunctionParser(typeName, minimalInputRequired, parser);
    }
}

/**
 * A version of the Parser<T> class that store the typeName and the minimalInputRequired into
 * field.
 */
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
