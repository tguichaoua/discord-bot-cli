
export interface ArgParserResult {
    value: any;
    consumed: number;
}

export interface ArgParser {
    minArgNeeded: number;
    parse: (args: readonly string[]) => ArgParserResult | undefined;
}