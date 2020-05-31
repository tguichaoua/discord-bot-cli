import { ParsableType } from "../../models/ParsableType";
import { parseValue } from "./parseValue";
import { Message } from "discord.js";
import { ParsableDefinition } from "../../models/definition/ParsableDefinition";

export function parseFlags(
    message: Message, inputArguments: readonly string[],
    flagDefinitions: ReadonlyMap<string, ParsableDefinition>,
    shortcuts?: ReadonlyMap<string, string>
) {
    const args = [...inputArguments];
    const flagValues = new Map<string, ParsableType | undefined>();

    function parse(index: number, flagName: string, flagValue?: string, dontUseNextArg?: boolean): boolean {
        const flag = flagDefinitions.get(flagName);
        if (!flag) return false;

        if (flagValue) {
            const value = parseValue(flag, message, flagValue);
            if (value === undefined) return false;
            flagValues.set(flagName, value);
            args.splice(index, 1);
        } else {
            if (flag.type === "boolean") {
                flagValues.set(flagName, true);
                args.splice(index, 1);
            } else {
                if (dontUseNextArg) return false;
                if (index + 1 >= args.length) return false;
                const value = parseValue(flag, message, args[index + 1]);
                if (value === undefined) return false;
                flagValues.set(flagName, value);
                args.splice(index, 2);
            }
        }
        return true;
    }

    for (let i = 0; i < args.length; i++) {
        let f = args[i];

        if (f.match(/^--[^-].*$/)) {
            const parts = f.substring(2).split("=");
            if (!parse(i, parts[0], parts.length > 1 ? parts[1] : undefined)) return;
        } else if (f.match(/^-[a-zA-Z](=.+)?$/)) {
            const parts = f.substring(1).split("=");
            const flagName = shortcuts?.get(parts[0]);
            if (!flagName) return;
            if (!parse(i, flagName, parts.length > 1 ? parts[1] : undefined)) return;
        } else if (f.match(/^-[a-zA-Z]{2,}$/)) {
            const flags = f.substring(1).split("");
            for (let j = 0; j < flags.length; j++) {
                const flagName = shortcuts?.get(flags[j]);
                if (!flagName) return;
                if (!parse(i, flagName, undefined, j != flags.length - 1)) return;
            }
        } else
            continue;
        i--;
    }

    return flagValues;
}
