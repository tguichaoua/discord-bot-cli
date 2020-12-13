import { Parser } from "../parsers/Parser";

/** @category Definition */
export interface ParsableDefinition {
    /**  */
    readonly parser: Parser<any>;
    /** Provide a description. */
    readonly description?: string;
    /** The default value if there is no value to parse. */
    readonly defaultValue?: any;
}
