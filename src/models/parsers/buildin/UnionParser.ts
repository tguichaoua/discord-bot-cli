import { InvalidUnionTypeParseError, ParseError } from "../errors";
import { Parser, ParserType } from "../Parser";
import { ParsingContext } from "../ParsingContext";

export class UnionParser<T extends Parser<unknown>[] = Parser<unknown>[]> extends Parser<ParserType<T[number]>> {
    private readonly parsers: T;

    constructor(...parsers: T) {
        super(parsers.map(p => p.typeName).join(" | "), Math.min(...parsers.map(p => p.minimalInputRequired)));
        this.parsers = parsers;
    }

    protected parse(context: ParsingContext): ParserType<T[number]> {
        for (const parser of this.parsers) {
            try {
                return parser._parse(context.clone()) as ParserType<T[number]>;
            } catch (e) {
                if (!(e instanceof ParseError)) throw e;
            }
        }
        throw new InvalidUnionTypeParseError(this);
    }
}
