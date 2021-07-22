import { CommandDefinition } from "./definition/CommandDefinition";
import { CommandExecutor } from "./callbacks/CommandExecutor";
import { CommandGuard, CommandGuardDefinition, CommandGuardTuple } from "./guards";

export interface CommandData<
    T extends CommandDefinition,
    InheritedGuards extends CommandGuardTuple = never /*, S extends CommandSettings = Record<string, unknown>*/,
> {
    /** @internal */
    readonly def: T;
    /** @internal */
    readonly name: string;

    /** Called when the command is executed. */
    executor?: CommandExecutor<T, InheritedGuards | GetTupleGuards<NonNullable<T["guards"]>[number]>>;

    /** Sub-commands data. */
    readonly subs: {
        readonly [name in keyof T["subs"]]: CommandData<
            T["subs"][name],
            InheritedGuards | InheritGuard<NonNullable<T["guards"]>[number]> /*, Inherit<T, S>*/
        >;
    };
}

// /** @ignore */
// type Inherit<T extends CommandDefinition, S extends CommandSettings> = T["inherit"] extends false
//     ? T
//     : { [k in keyof CommandSettings]-?: undefined extends T[k] ? S[k] : T[k] };

type InheritGuard<Guards extends CommandGuardDefinition> = Guards extends readonly [infer B, infer K, infer G]
    ? B extends true
        ? readonly [B, K, G]
        : never
    : never;

type GetTupleGuards<T extends CommandGuard | CommandGuardTuple> = T extends readonly [boolean, string, CommandGuard]
    ? T
    : never;
