import { ArgParserBase, ArgParseResult } from "./ArgParserBase";


export class NumberParser extends ArgParserBase {
    private _radix: number | undefined;

    constructor(radix?: number) {
        super();
        this._radix = radix;
    }

    get minArgNeeded(): number { return 1; }

    parse(args: string[]): ArgParseResult | undefined {
        const num = parseInt(args[0], this._radix);
        if (!isNaN(num))
            return ArgParserBase.ok(num, 1);
    }
}