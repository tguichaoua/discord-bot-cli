import { ParsableTypeName, ParsableTypeOf } from "../ParsableType";

interface Parsable<TypeName extends ParsableTypeName> {
    description?: string;
    /** The type in which is parsed the value. */
    type: TypeName
    /** Used to check if parsed value satisfy certain conditions. */
    validator?: (value: ParsableTypeOf<TypeName>) => boolean;
    /** The default value if there is no value to parse. */
    defaultValue?: ParsableTypeOf<TypeName>
}

// I not found a better solution.
type foo<T extends ParsableTypeName> = T extends any ? Parsable<T> : never;

export type ParsableDefinition = foo<ParsableTypeName>;