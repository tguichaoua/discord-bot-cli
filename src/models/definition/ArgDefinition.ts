import { Parser } from "../parsers";

// /** @category Definition */
// export type ArgDefinition = ParsableDefinition & {
//     /** If set to true, this argument can be omitted. In this case defaultValue is used. (default is false) */
//     readonly optional?: boolean;
// };

export interface ArgDef {
    /**  */
    readonly parser: Parser<unknown>;
    /** Provide a description. */
    readonly description?: string;
    /** The default value if there is no value to parse. */
    readonly defaultValue?: unknown;
    /** If set to true, this argument can be omitted. In this case defaultValue is used. (default is false) */
    readonly optional?: boolean;
}
