type OptionnalArg<T> =
    {
        optionnal?: false,
    } |
    {
        optionnal: true,
        defaultValue?: T,
    };

type ArgParser<ParserName, Type, Config = {}> =
    { type: ParserName } &
    OptionnalArg<Type> &
    Config;

export type ArgDef =
    {
        description?: string
    } &
    (
        ArgParser<"string", string> |
        ArgParser<"number", number> |
        ArgParser<"range", number, { min: number, max: number }>

        //ArgParser<"custom"> // TODO
    )