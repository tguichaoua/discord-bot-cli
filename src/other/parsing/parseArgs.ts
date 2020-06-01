import { Message } from "discord.js";
import { ParsableType } from "../../models/ParsableType";
import { parseValue } from "./parseValue";
import { ArgDefinition } from "../../models/definition/ArgDefinition";
import { CommandResultUtils } from "../../models/CommandResult";
import { CommandResultError } from "../../models/CommandResultError";

export function parseArgs(
    message: Message, inputArguments: readonly string[],
    argDefinitions: ReadonlyMap<string, ArgDefinition>
) {
    const args = [...inputArguments];
    const argValues = new Map<string, ParsableType | undefined>();

    for (const [name, def] of argDefinitions) {
        let value: ParsableType | undefined;
        if (args.length === 0) {
            if (!def.optional) throw new CommandResultError(CommandResultUtils.failParseArgMissing(def));
            value = def.defaultValue;
        } else {
            const val = args.shift() as string;
            const parsed = parseValue(def, message, val);
            if (!parsed) throw new CommandResultError(CommandResultUtils.failParseArgInvalid(def, val));
            value = parsed;
        }
        argValues.set(name, value);
    }

    return { argValues, rest: args };
}