import { ParsableTypeName, ParsableType, ParsableTypeOf } from "../ParsableType";

export interface Parsable<TypeName extends ParsableTypeName> {
    description?: string;
    type: TypeName
    validator?: (value: ParsableTypeOf<TypeName>) => boolean;
    defaultValue?: ParsableTypeOf<TypeName>
}

export type ParsableDef =
    Parsable<"string"> |
    Parsable<"boolean"> |
    Parsable<"integer"> |
    Parsable<"float">;
