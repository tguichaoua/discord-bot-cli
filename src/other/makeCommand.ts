import { CommandDefinition } from "../models/definition/CommandDefinition";
import { CommandData } from "../models/CommandData";

export function makeCommand<T extends CommandDefinition>(name: string, definition: T): CommandData<T> {
    // TODO
    return {} as any;
}
