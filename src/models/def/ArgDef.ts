import { ParsableType as ParsableTypeName } from "../ParsableType";

type ArgParser<Name extends ParsableTypeName, Type> =
    {
        type: Name;
        description?: string;
        validator?: (value: Type) => boolean;
    } &
    (
        {
            optionnal?: false,
        } |
        {
            optionnal: true,
            defaultValue?: Type,
        }
    );

export type ArgDef =
    ArgParser<"string", string> |
    ArgParser<"integer", number> |
    ArgParser<"float", number> |
    ArgParser<"boolean", boolean>;