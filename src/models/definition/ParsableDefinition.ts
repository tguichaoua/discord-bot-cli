import { ParsableTypeName, ParsableTypeOf } from "../ParsableType";

/** @category Definition */
interface Parsable<TypeNames extends ParsableTypeName | readonly ParsableTypeName[]> {
    /** Provide a description. */
    readonly description?: string;
    /** The type in which is parsed the value. */
    readonly type: TypeNames;
    /** Used to check if parsed value satisfy certain conditions. */
    readonly validator?: (value: ParsableTypeOf<TypeNames>) => boolean | string;
    /** The default value if there is no value to parse. */
    readonly defaultValue?: ParsableTypeOf<TypeNames>;
}

// I have not found a better solution.
type WrapParsable<T extends ParsableTypeName> = T extends any // eslint-disable-line @typescript-eslint/no-explicit-any
    ? Parsable<T>
    : never;

/** @category Definition */
export type ParsableDefinition = WrapParsable<ParsableTypeName> | Parsable<readonly ParsableTypeName[]>;
