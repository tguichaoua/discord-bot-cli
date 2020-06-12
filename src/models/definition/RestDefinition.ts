import { ParsableTypeName } from "../ParsableType";

export type RestDefinition = {
    type: ParsableTypeName;
    name: string;
    description?: string;
}