import { CommandDefinition } from "./definition/CommandDefinition";
import { CommandExecutor } from "./callbacks/CommandExecutor";

export interface CommandData<T extends CommandDefinition> {
    /** @internal */
    readonly def: T;
    /** @internal */
    readonly name: string;

    /** Called when the command is executed. */
    executor?: CommandExecutor<T>;

    /** Sub-commands data. */
    readonly subs: { readonly [name in keyof T["subs"]]: CommandData<T["subs"][name]> }
}