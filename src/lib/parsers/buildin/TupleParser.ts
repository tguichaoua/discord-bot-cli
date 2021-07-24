import {
    InvalidArgumentTypeError,
    NotEnoughArgParseError,
    ParseError,
    TupleInvalidValueParserError,
    TupleNotEnoughArgumentParserError,
    TupleTooMuchArgumentParserError,
} from "../errors";
import { CustomParser, Parser, ParserTupleType } from "../Parser";
import { ParsingContext } from "../ParsingContext";

export class TupleParser<P extends Parser<unknown>[] = Parser<unknown>[]> extends CustomParser<ParserTupleType<P>> {
    public readonly inners: Readonly<P>;

    constructor(...parsers: P) {
        super(`[${parsers.map(p => p.typeName).join(" ")}]`);
        this.inners = parsers;
    }

    public parse(context: ParsingContext): ParserTupleType<P> {
        const next = context.next();
        if (next.kind !== "group") throw new InvalidArgumentTypeError("$tuple$", next);
        const tupleContext = new ParsingContext(context.message, next.content);
        const values = this.inners.map((p, i) => {
            try {
                return p.parse(tupleContext);
            } catch (e) {
                if (e instanceof NotEnoughArgParseError) throw new TupleNotEnoughArgumentParserError(this);
                if (e instanceof ParseError) throw new TupleInvalidValueParserError(this, i, e);
                throw e;
            }
        });

        if (tupleContext.remaining !== 0) throw new TupleTooMuchArgumentParserError(this);
        return values as ParserTupleType<P>;
    }

    static create<P extends Parser<unknown>[]>(...parsers: P): Parser<ParserTupleType<P>> {
        return new TupleParser(...parsers);
    }
}
