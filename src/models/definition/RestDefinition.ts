import { ParsableTypeName } from "../ParsableType";

/** @category Definition */
export interface RestDefinition {
    /** Type(s) of the rest. */
    type: ParsableTypeName | ParsableTypeName[];
    /** Name to diplay in help. */
    name: string;
    /** Description to display in help. */
    description?: string;
}
