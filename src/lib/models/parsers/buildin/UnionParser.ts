import { InvalidUnionTypeParseError, ParseError } from "../errors";
import { CustomParser, Parser, ParserType } from "../Parser";
import { ParsingContext } from "../ParsingContext";

export class UnionParser<P extends Parser<unknown>[] = Parser<unknown>[]> extends CustomParser<ParserType<P[number]>> {
    public readonly inners: Readonly<P>;

    constructor(...parsers: P) {
        super(parsers.map(p => p.typeName).join(" | "));
        this.inners = parsers;
    }

    public parse(context: ParsingContext): ParserType<P[number]> {
        context.saveState();
        for (const parser of this.inners) {
            try {
                context.restoreState();
                const value = parser.parse(context) as ParserType<P[number]>;
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
