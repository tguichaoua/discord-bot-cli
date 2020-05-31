import { Message } from "discord.js";
import { ParsableType, getDefaultValue } from "../../models/ParsableType";
import { parseValue } from "./parseValue";
import { ArgDefinition } from "../../models/definition/ArgDefinition";

export function parseArgs(
    message: Message, inputArguments: readonly string[],
    argDefinitions: ReadonlyMap<string, ArgDefinition>
) {
    const args = [...inputArguments];
    const argValues = new Map<string, ParsableType>();

    for (const [name, def] of argDefinitions) {
        let value: ParsableType;
        if (args.length === 0) {
            if (!def.optional) return;
            value = def.defaultValue ?? getDefaultValue(def.type);
        } else {
            const parsed = parseValue(def, message, args.shift() as string);
            if (!parsed) return;
            value = parsed;
        }
        argValues.set(name, value);
    }

    return argValues;
}