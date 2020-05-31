import { CommandDefinition } from "../models/definition/CommandDefinition";
import { CommandData } from "../models/CommandData";

export function makeCommand<T extends CommandDefinition>(name: string, definition: T): CommandData<T> {
    let subs = {} as any;
    for (let key in definition.subs) {
        subs[key] = makeCommand(key, definition.subs[key]);
    }

    return {
        data: definition,
        name,
        subs
    };
}