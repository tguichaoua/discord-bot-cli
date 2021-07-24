import { distinct } from "../utils/array";
import { map } from "../utils/object";

import { CommandDefinition } from "./definitions";
import { CommandData } from "./CommandData";

/**
 * Generate command data.
 * @param name Name of the command.
 * @param definition Definition of the command.
 */
export function makeCommand<T extends CommandDefinition>(name: string, definition: T): CommandData<T> {
    const subs = definition.subs ? map(definition.subs, (def, key) => makeCommand(key, def)) : {};

    if (definition.clientPermissions)
        (definition.clientPermissions as unknown) = distinct(definition.clientPermissions);

    return {
        def: definition,
        name,
        subs: subs as CommandData<T>["subs"],
    };
}
