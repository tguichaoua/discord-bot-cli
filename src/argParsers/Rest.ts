import { ArgParserBase, ArgParseResult } from "./ArgParserBase";

let singleton: RestParser;

export class RestParser extends ArgParserBase {
    constructor() {
        if(!singleton) {
            super();
            singleton = this;
        }
        return singleton;
    }

    get minArgNeeded(): number { return 0; }

    parse(args: string[]): ArgParseResult | undefined {
        return ArgParserBase.ok([...args], args.length);
    }
}