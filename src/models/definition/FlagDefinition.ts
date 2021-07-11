import { Char } from "../../utils/char";
import { Parser } from "../parsers";

export interface FlagDefinition {
    /**  */
    readonly parser?: Parser<unknown>;
    /** Provide a description. */
    readonly description?: string;
    /** The default value if there is no value to parse. */
    readonly defaultValue?: unknown;
    /** Shortcut version of the flag. */
    readonly short?: Char | null;
    /** */
    readonly long?: string | null;
}
