import { ParsableType } from "../../models/ParsableType";
import { parseValue } from "./parseValue";
import { Message } from "discord.js";
import { ParsableDefinition } from "../../models/definition/ParsableDefinition";
import { CommandResultUtils } from "../../models/CommandResult";
import { CommandResultError } from "../../models/CommandResultError";

export function parseFlags(
    message: Message, inputArguments: readonly string[],
    flagDefinitions: ReadonlyMap<string, ParsableDefinition>,
    shortcuts?: ReadonlyMap<string, string>
) {
    const args = [...inputArguments];
    const flagValues = new Map<string, ParsableType | undefined>(
        Array.from(flagDefinitions.entries()).map(([k, v]) => [k, v.defaultValue])
    );

    function parse(index: number, flagName: string, flagValue?: string, dontUseNextArg?: boolean) {
        const flag = flagDefinitions.get(flagName);
        if (!flag) throw new CommandResultError(CommandResultUtils.failParseFlagUnknown(flagName));

        if (flagValue) {
            const parsed = parseValue(flag, message, flagValue);
            if (parsed.value === undefined) throw new CommandResultError(CommandResultUtils.failParseFlagInvalid(flag, flagValue), parsed.message);
            flagValues.set(flagName, parsed.value);
            args.splice(index, 1);
        } else {
            if (flag.type === "boolean") {
                flagValues.set(flagName, true);
                args.splice(index, 1);
            } else {
                if (dontUseNextArg || index + 1 >= args.length) throw new CommandResultError(CommandResultUtils.failParseFlagInvalid(flag, ""));
                const parsed = parseValue(flag, message, args[index + 1]);
                if (parsed.value === undefined) throw new CommandResultError(CommandResultUtils.failParseFlagInvalid(flag, args[index + 1]), parsed.message);
                flagValues.set(flagName, parsed.value);
                args.splice(index, 2);
            }
        }
    }

    for (let i = 0; i < args.length; i++) {
        let f = args[i];

        if (f.match(/^--[^-].*$/)) {
            const parts = f.substring(2).split("=");
            parse(i, parts[0], parts.length > 1 ? parts[1] : undefined);
        } else if (f.match(/^-[a-zA-Z](=.+)?$/)) {
            const parts = f.substring(1).split("=");
            const flagName = shortcuts?.get(parts[0]);
            if (!flagName) throw new CommandResultError(CommandResultUtils.failParseFlagUnknown(parts[0]));
            parse(i, flagName, parts.length > 1 ? parts[1] : undefined);
        } else if (f.match(/^-[a-zA-Z]{2,}$/)) {
            const flags = f.substring(1).split("");
            for (let j = 0; j < flags.length; j++) {
                const flagName = shortcuts?.get(flags[j]);
                if (!flagName) throw new CommandResultError(CommandResultUtils.failParseFlagUnknown(flags[j]));
                parse(i, flagName, undefined, j != flags.length - 1);
            }
        } else
            continue;
        i--;
    }

    return { args, flagValues };
}
