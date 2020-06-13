import { CommandDefinition } from "../models/definition/CommandDefinition";
import { CommandData } from "../models/CommandData";
import { ParsableTypeName } from "../models/ParsableType";

export function makeCommand<T extends CommandDefinition>(name: string, definition: T): CommandData<T> {
    let subs = {} as any;
    for (let key in definition.subs) {
        subs[key] = makeCommand(key, definition.subs[key]);
    }

    for (const k in definition.args) {
        const t = definition.args[k].type;
        if (Array.isArray(t))
            t.sort(sortParsableType);
    }

    for (const k in definition.flags) {
        const t = definition.flags[k].type;
        if (Array.isArray(t))
            t.sort(sortParsableType);
    }

    if (definition.rest && Array.isArray(definition.rest.type))
        definition.rest.type.sort(sortParsableType);

    return {
        def: definition,
        name,
        subs
    };
}

/** @internal */
const parsableOrderer: ParsableTypeName[] = [
    "guild channel",
    "channel",
    "integer",
    "float",
    "string",
]

/** @internal */
function sortParsableType(a: ParsableTypeName, b: ParsableTypeName): number {
    return parsableOrderer.indexOf(a) - parsableOrderer.indexOf(b);
}