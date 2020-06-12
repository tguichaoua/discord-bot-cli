import { ParsableTypeName } from "../ParsableType";

export type RestDefinition = {
    type: ParsableTypeName | ParsableTypeName[];
    name: string;
    description?: string;
}