import { Parser } from "../parsers";

/** @category Definition */
export interface RestDefinition {
    /**  */
    parser: Parser<any>;
    /** Name to diplay in help. */
    name: string;
    /** Description to display in help. */
    description?: string;
}
