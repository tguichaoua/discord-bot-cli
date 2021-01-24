import { ParsingContext } from "../ParsingContext";
import { Parser } from "../Parser";

export class RestParser extends Parser<string[]> {
    public get typeName() {
        return "$string$...";
    }

    protected parse(context: ParsingContext): string[] {
        return context.rest();
    }
}
