import { FlagDefinition } from "../../models/definition/FlagDefinition";
import { ParsableType } from "../../models/ParsableType";
import { parseValue } from "./parseValue";
import { Message } from "discord.js";

export function parseFlags(inputArguments: readonly string[], flagDefinitions: ReadonlyMap<string, FlagDefinition>, message: Message) {

    const args = [...inputArguments];
    const flags = new Map<string, ParsableType | undefined>();

    function parse(index: number, flagName: string, flagValue?: string): boolean {
        const flag = flagDefinitions.get(flagName);
        if (!flag) return false;

        if (flagValue) {
            const value = parseValue(flag, message, flagValue);
            if (value === undefined) return false;
            flags.set(flagName, value);
            args.splice(index, 1);
        } else {
            if (flag.type === "boolean") {
                flags.set(flagName, true);
                args.splice(index, 1);
            } else {
                if (index + 1 >= args.length) return false;
                const value = parseValue(flag, message, args[index + 1]);
                if (value === undefined) return false;
                flags.set(flagName, value);
                args.splice(index, 2);
            }
        }
        return true;
    }


    for (let i = 0; i < args.length; i++) {
        let f = args[i];
        let flagName: string | undefined;
        let flagValue: string | undefined;

        if (f.match(/^--[^-].*$/)) {
            const parts = f.substring(2).split("=");
            if (!parse(i, parts[0], parts.length > 1 ? parts[1] : undefined)) return;
            i--;
        } else if (f.match(/^-[a-zA-Z](=.+)?$/)) {
            const parts = f.substring(1).split("=");
            flagName =  flagDefinitions.values();
            flagValue = parts.length > 1 ? parts[1] : undefined;
        } else if (f.match(/^-[a-zA-Z]{2,}$/)) {

        } else
            continue;


    }
}
