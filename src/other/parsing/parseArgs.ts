import { Message } from "discord.js";
import { ArgDef } from "../../models/definition/ArgDefinition";
import { CommandResultUtils } from "../../models/CommandResult";
import { CommandResultError } from "../../models/errors/CommandResultError";
import { ParsingContext, ParseError } from "../../models/parsers";
import { Logger } from "../../logger";

/** @internal */
export function parseArgs(
    message: Message,
    inputArguments: readonly string[],
    argDefinitions: ReadonlyMap<string, ArgDef>,
) {
    const context = new ParsingContext(message, inputArguments);
    const values = new Map<string, unknown>();

    for (const [name, def] of argDefinitions) {
        let value: unknown;
        if (context.remaining === 0) {
            if (!def.optional) throw new CommandResultError(CommandResultUtils.failParseArgMissing(def));
            value = def.defaultValue;
        } else {
            try {
                value = def.parser._parse(context);
            } catch (e) {
                if (e instanceof ParseError) {
                    // TODO
                    Logger.debug("TODO: catch parse error:", e);
                    throw e;
                } else {
                    // TODO
                    Logger.debug("TODO: catch error while parsing:", e);
                    throw e;
                }
            }
        }
        values.set(name, value);
    }

    return { argValues: values, rest: context.rest() };
}
