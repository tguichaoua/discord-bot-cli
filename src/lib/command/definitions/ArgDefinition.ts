import { Parser } from "../../parser";

export interface ArgDefinition {
    /** The parser used to parse the value of the argument. */
    readonly parser: Parser<unknown>;
    /** The description of the argument. */
    readonly description?: string;
    /** The default value returned if there is no value to parse. */
    readonly defaultValue?: unknown;
    /** If set to true, this argument can be omitted. In this case defaultValue is used. (default is false) */
    readonly optional?: boolean;
}
