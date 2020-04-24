import { Char } from "../utils/char"

type Flag<TypeName, Type> = 
{
    type: TypeName,
    description?: string,
    defaultValue?: Type,
    shortcut: Char,
}

export type FlagDef = Flag<"string", string> | Flag<"boolean", boolean>;