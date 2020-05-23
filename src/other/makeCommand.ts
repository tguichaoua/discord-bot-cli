import { CommandDefinition } from "../models/definition/CommandDefinition";
import { CommandData } from "../models/CommandData";

export function makeCommand<T extends CommandDefinition>(definition: T): CommandData<T> {
    // TODO
    return {} as any;
}