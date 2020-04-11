import { ArgParserBase, ArgParseResult } from './ArgParserBase';

let singleton: DefaultParser;

export class DefaultParser extends ArgParserBase {
    constructor() {
        if (!singleton) {
            super();
            singleton = this;
        }
        return singleton;
    }

    get minArgNeeded(): number { return 1 };

    parse(args: string[]): ArgParseResult | undefined {
        return ArgParserBase.ok(args[0], 1);
    }
}