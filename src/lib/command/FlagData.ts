import { Parser } from "../parser";
import { Char } from "../utils/Char";

export interface FlagData {
    readonly key: string;
    readonly parser: Parser<unknown> | undefined;
    readonly description: string | undefined;
    readonly defaultValue: unknown | undefined;
    readonly long: string | undefined;
    readonly short: Char | undefined;
}
