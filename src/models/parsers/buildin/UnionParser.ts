import { InvalidTypeParseError, ParseError } from "../errors";
import { Parser, ParserType } from "../Parser";
import { ParsingContext } from "../ParsingContext";

export class UnionParser<T extends Parser<unknown>[]> extends Parser<ParserType<T[number]>> {
    private readonly parsers: T;

    constructor(...parsers: T) {
        super();
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
        throw new InvalidTypeParseError();
    }
}
