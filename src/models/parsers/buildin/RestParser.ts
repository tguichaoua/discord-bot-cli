import { ParsingContext } from "../ParsingContext";
import { Parser } from "../Parser";

export class RestParser extends Parser<string[]> {
    constructor() {
        super("$string$...", 0);
    }

    protected parse(context: ParsingContext): string[] {
        return context.rest();
    }
}
