import { InvalidTypeParseError, ParseError } from "../errors";
import { Parser, ParserType } from "../Parser";
import { ArgProvider } from "../ArgProvider";

export class OrParser<T extends Parser<any>[]> implements Parser<ParserType<T[number]>> {
    private readonly parsers: T;

    public constructor(...parsers: T) {
        this.parsers = parsers;
    }

    parse(provider: ArgProvider): ParserType<T[number]> {
        for (const parser of this.parsers) {
            try {
                return parser.parse(provider.clone());
            } catch (e) {
                if (!(e instanceof ParseError)) throw e;
            }
        }
        throw new InvalidTypeParseError();
    }
}
