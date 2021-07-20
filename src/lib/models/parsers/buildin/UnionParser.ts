import { InvalidUnionTypeParseError, ParseError } from "../errors";
import { CustomParser, Parser, ParserType } from "../Parser";
import { ParsingContext } from "../ParsingContext";

export class UnionParser<T extends Parser<unknown>[] = Parser<unknown>[]> extends CustomParser<ParserType<T[number]>> {
    private readonly parsers: T;

    constructor(...parsers: T) {
        super(parsers.map(p => p.typeName).join(" | "));
        this.parsers = parsers;
    }

    public parse(context: ParsingContext): ParserType<T[number]> {
        context.saveState();
        for (const parser of this.parsers) {
            try {
                context.restoreState();
                const value = parser.parse(context) as ParserType<T[number]>;
                context.removeState();
                return value;
            } catch (e) {
                if (!(e instanceof ParseError)) throw e;
            }
        }
        throw new InvalidUnionTypeParseError(this);
    }

    /**
     * Parses the value using each parser **in order** until the first that successfully parse the value.
     */
    static create<P extends Parser<unknown>[] = Parser<unknown>[]>(...parsers: P): Parser<ParserType<P[number]>> {
        return new UnionParser(...parsers);
    }
}
