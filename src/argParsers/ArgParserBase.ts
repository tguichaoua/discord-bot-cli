
export interface ArgParseResult {
    value: any;
    consumed: number;
}

export abstract class ArgParserBase {
    constructor() { }

    abstract get minArgNeeded(): number;

    abstract parse(args: string[]): ArgParseResult | undefined;

    static ok(value: any, consumed: number): ArgParseResult { return { value, consumed }; }
}