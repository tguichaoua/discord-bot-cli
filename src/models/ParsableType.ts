export type ParsableTypeName = "string" | "boolean" | "integer" | "float" | "rest";
export type ParsableType = string | boolean | number | string[];
export type ParsableTypeOf<Name extends ParsableTypeName> =
    Name extends "string" ? string :
    Name extends "boolean" ? boolean :
    Name extends "integer" ? number :
    Name extends "float" ? number :
    Name extends "rest" ? string[] :
    never;

export function getDefaultValue(name: ParsableTypeName): ParsableType {
    switch (name) {
        case "string": return "";
        case "integer": case "float": return 0;
        case "boolean": return false;
        case "rest": return [];
    }
}