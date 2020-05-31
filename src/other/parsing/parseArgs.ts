import { Message } from "discord.js";
import { ParsableType } from "../../models/ParsableType";
import { parseValue } from "./parseValue";
import { ArgDefinition } from "../../models/definition/ArgDefinition";

export function parseArgs(
    message: Message, inputArguments: readonly string[],
    argDefinitions: ReadonlyMap<string, ArgDefinition>
) {
    const args = [...inputArguments];
    const argValues = new Map<string, ParsableType | undefined>();

    for (const [name, def] of argDefinitions) {
        let value: ParsableType | undefined;
        if (args.length === 0) {
            if (!def.optional) return;
            value = def.defaultValue;
        } else {
            const parsed = parseValue(def, message, args.shift() as string);
            if (!parsed) return;
            value = parsed;
        }
        argValues.set(name, value);
    }

    return { argValues, rest: args };
}