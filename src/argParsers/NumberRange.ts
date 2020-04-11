import { ArgParserBase, ArgParseResult } from "./ArgParserBase";

export class NumberRangeParser extends ArgParserBase {

    private _min: number;
    private _max: number;
    private _radix: number | undefined;

    constructor(min: number, max: number, radix?: number) {
        super();

        if (typeof min !== 'number' || typeof max !== 'number')
            throw TypeError('NumberRange : min & max values must be numbers.');

        if (min > max)
            throw Error("NumberRange : max must be greater than min.");

        this._min = min;
        this._max = max;
        this._radix = radix;
    }

    get minArgNeeded(): number { return 1; }

    parse(args: string[]): ArgParseResult | undefined {
        const num = parseInt(args[0], this._radix);
        if (num >= this._min && num <= this._max)
            return ArgParserBase.ok(num, 1);
    }
}