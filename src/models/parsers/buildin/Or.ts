import { InvalidTypeParseError, ParseError } from "../errors";
import { Parser, ParserType } from "../Parser";
import { ParsingContext } from "../ParsingContext";

export class OrParser<T extends Parser<any>[]> extends Parser<ParserType<T[number]>> {
    private readonly parsers: T;

    constructor(...parsers: T) {
        super();
        this.parsers = parsers;
    }

    protected parse(context: ParsingContext): ParserType<T[number]> {
        for (const parser of this.parsers) {
            try {
                return parser._parse(context.clone());
            } catch (e) {
                if (!(e instanceof ParseError)) throw e;
            }
        }
        throw new InvalidTypeParseError();
    }
}
