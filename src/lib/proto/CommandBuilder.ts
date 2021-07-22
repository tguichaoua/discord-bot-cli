import { CommandExecutor } from "../models/callbacks/CommandExecutor";
import { CommandDefinition, CommandSettings } from "../models/definition/CommandDefinition";
import { Parsers } from "../models/parsers";

export class CommandBuilder<Def extends CommandDefinition, S extends CommandSettings = Record<string, unknown>> {
    /** @internal */
    readonly name: string;

    /** @internal */
    readonly definition: Def;

    /** @internal */
    readonly subs = new Map<string, CommandBuilder<CommandDefinition>>();

    private constructor(name: string, definition: Def) {
        this.name = name;
        this.definition = definition;
    }

    public static create<Def extends CommandDefinition>(
        name: string,
        definition: Def,
        executor?: CommandExecutor<Def, Def>,
    ): CommandBuilder<Def, Def> {
        console.log(name, definition, executor);
        return null as any; // TODO
    }

    public sub<SubDef extends CommandDefinition>(
        name: string,
        definition: SubDef,
        executor?: CommandExecutor<SubDef, Inherit<SubDef, S>>,
    ): CommandBuilder<SubDef, Inherit<SubDef, S>> {
        console.log(name, definition, executor);
        return null as any; // TODO
    }
}

type Inherit<T extends CommandDefinition, S extends CommandSettings> = T["inherit"] extends false
    ? T
    : { [k in keyof CommandSettings]-?: undefined extends T[k] ? S[k] : T[k] };

const a = CommandBuilder.create(
    "",
    {
        guildOnly: true,
        args: {
            t: { parser: Parsers.float },
        },
    },
    (_a, _f, { guild }) => {
        console.log(guild.name);
    },
);

const b = a.sub("b", {}, (_a, _f, { guild }) => {
    console.log(guild.name);
});

b.sub("c", {});

a.sub("d", { inherit: false }, (_a, _f, { guild }) => {
    console.log(guild?.name);
});
