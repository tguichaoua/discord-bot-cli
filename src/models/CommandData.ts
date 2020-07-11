import {
    CommandDefinition,
    CommandSettings,
} from "./definition/CommandDefinition";
import { CommandExecutor } from "./callbacks/CommandExecutor";

export interface CommandData<
    T extends CommandDefinition,
    S extends CommandSettings = Record<string, unknown>
> {
    /** @internal */
    readonly def: T;
    /** @internal */
    readonly name: string;

    /** Called when the command is executed. */
    executor?: CommandExecutor<T, Inherit<T, S>>;

    /** Sub-commands data. */
    readonly subs: {
        readonly [name in keyof T["subs"]]: CommandData<
            T["subs"][name],
            Inherit<T, S>
        >;
    };
}

type Inherit<
    T extends CommandDefinition,
    S extends CommandSettings
> = T["inherit"] extends false
    ? T
    : { [k in keyof CommandSettings]-?: undefined extends T[k] ? S[k] : T[k] };
