import { CommandDefinition } from "../models/definition/CommandDefinition";
import { CommandData } from "../models/CommandData";
import { distinct } from "../utils/array";

/**
 * Generate command data.
 * @param name Name of the command.
 * @param definition Definition of the command.
 */
export function makeCommand<T extends CommandDefinition>(name: string, definition: T): CommandData<T> {
    const subs = definition.subs ? mapEntries(definition.subs, (def, key) => makeCommand(key, def)) : {};

    // for (const k in definition.args) {
    //     const t = definition.args[k].type;
    //     if (Array.isArray(t)) t.sort(sortParsableType);
    // }

    // for (const k in definition.flags) {
    //     const t = definition.flags[k].type;
    //     if (Array.isArray(t)) t.sort(sortParsableType);
    // }

    // if (definition.rest && Array.isArray(definition.rest.type)) definition.rest.type.sort(sortParsableType);

    if (definition.clientPermissions)
        (definition.clientPermissions as unknown) = distinct(definition.clientPermissions);

    return {
        def: definition,
        name,
        subs: subs as CommandData<T>["subs"],
    };
}

// /** @internal */
// const parsableOrderer: ParsableTypeName[] = ["guild channel", "channel", "integer", "float", "string"];

// /** @internal */
// function sortParsableType(a: ParsableTypeName, b: ParsableTypeName): number {
//     return parsableOrderer.indexOf(a) - parsableOrderer.indexOf(b);
// }
