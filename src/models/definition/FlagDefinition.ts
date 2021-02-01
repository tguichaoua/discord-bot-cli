import { Char } from "../../utils/char";
import { Parser } from "../parsers";

// /** @category Definition */
// export type FlagDefinition = ParsableDefinition & {
//     /** Shortcut version of the flag. */
//     readonly shortcut?: Char;
// };

export interface FlagDef {
    /**  */
    readonly parser?: Parser<unknown>;
    /** Provide a description. */
    readonly description?: string;
    /** The default value if there is no value to parse. */
    readonly defaultValue?: unknown;
    /** Shortcut version of the flag. */
    readonly shortcut?: Char;
}
