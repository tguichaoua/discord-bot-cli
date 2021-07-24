import { Char } from "../../utils/Char";
import { Parser } from "../../parser";

export interface FlagDefinition {
    /** The parser used to parse the flag value.
     * If not set, the flag value is the number of occurrences of the flag.
     */
    readonly parser?: Parser<unknown>;
    /** The description of the flag. */
    readonly description?: string;
    /** The value returned if the flag is not passed by the user.
     * Otherwise the value returned is `undefined`.
     * Ignored if the parser is not set.
     */
    readonly defaultValue?: unknown;
    /** The long name of the flag (eg '--flag).
     * If not set, the key of the flag is used as kebab case.
     * If set to `null`, the flag has no long name.
     */
    readonly long?: string | null;
    /** The short name of the flag (eg '-f').
     * If not set, use the first letter of the long name.
     * If set to `null`, the flag has no short name.
     */
    readonly short?: Char | null;
}
