export type ParsableTypeName = "string" | "boolean" | "integer" | "float";
export type ParsableType = string | boolean | number;
export type ParsableTypeOf<Name extends ParsableTypeName> =
    Name extends "string" ? string :
    Name extends "boolean" ? boolean :
    Name extends "integer" ? number :
    Name extends "float" ? number :
    never;

export function getDefaultValue(name: ParsableTypeName): ParsableType {
    switch (name) {
        case "string": return "";
        case "integer": case "float": return 0;
        case "boolean": return false;
    }
}