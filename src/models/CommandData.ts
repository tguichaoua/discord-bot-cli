import { CommandDefinition } from "./definition/CommandDefinition";
import { CommandExecutor } from "./CommandExecutor";


export interface CommandData<T extends CommandDefinition> {
    /** @internal */
    data: T;

    /** Called when the command is executed. */
    executor?: CommandExecutor<T>;

    /** Sub-commands data. */
    subs: { [name in keyof T["subs"]] : CommandData<T["subs"][name]> }
}