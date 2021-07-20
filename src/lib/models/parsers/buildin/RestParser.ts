import { NotEnoughArgParseError } from "../errors";
import { Parser, WrapperParser } from "../Parser";
import { ParsingContext } from "../ParsingContext";

export class RestParser<T> extends WrapperParser<T, T[]> {
    constructor(inner: Parser<T>) {
        super(inner);
    }

    get typeName() {
        return this.inner.typeName + "...";
    }

    public parse(context: ParsingContext): T[] {
        const rest: T[] = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                rest.push(this.inner.parse(context));
            } catch (e) {
                if (e instanceof NotEnoughArgParseError) return rest;
                throw e;
            }
        }
    }

    /**
     * Parse every remaining arguments using the inner parser.
     * @param inner The parser used to parse arguments
     */
    static create<T>(inner: Parser<T>): Parser<T[]> {
        return new RestParser(inner);
    }
}
