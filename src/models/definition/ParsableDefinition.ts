import { ParsableTypeName, ParsableTypeOf } from "../ParsableType";

interface Parsable<TypeName extends ParsableTypeName> {
    /** Provide a description. */
    readonly description?: string;
    /** The type in which is parsed the value. */
    readonly type: TypeName;
    /** Used to check if parsed value satisfy certain conditions. */
    readonly validator?: (value: ParsableTypeOf<TypeName>) => boolean | string;
    /** The default value if there is no value to parse. */
    readonly defaultValue?: ParsableTypeOf<TypeName>;
}

// I not found a better solution.
type WrapParsable<T extends ParsableTypeName> = T extends any ? Parsable<T> : never;

export type ParsableDefinition = WrapParsable<ParsableTypeName>;