import { ParsableTypeName, ParsableTypeOf } from "../ParsableType";

export interface Parsable<TypeName extends ParsableTypeName> {
    description?: string;
    /** The type in which is parsed the value. */
    type: TypeName
    /** Used to check if parsed value satisfy certain conditions. */
    validator?: (value: ParsableTypeOf<TypeName>) => boolean;
    /** The default value if there is no value to parse. */
    defaultValue?: ParsableTypeOf<TypeName>
}

export type ParsableDef =
    Parsable<"string"> |
    Parsable<"boolean"> |
    Parsable<"integer"> |
    Parsable<"float"> |
    Parsable<"user"> |
    Parsable<"channel">;
