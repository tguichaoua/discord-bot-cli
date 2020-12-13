import { Message } from "discord.js";
import { CommandResultUtils } from "../../models/CommandResult";
import { CommandResultError } from "../../models/errors/CommandResultError";
import { FlagDef } from "../../models/definition/FlagDefinition";
import { Logger } from "../../logger";
import { Char } from "../../utils/char";
import { ParsingContext, ParseError } from "../../models/parsers";

/** @internal */
export function parseFlags(
    message: Message,
    inputArguments: readonly string[],
    flagDefinitions: ReadonlyMap<string, FlagDef>,
    shortcuts: ReadonlyMap<Char, string>,
) {
    const args = [...inputArguments];
    const flagValues = new Map<string, unknown>(
        Array.from(flagDefinitions.entries()).map(([k, v]) => [k, v.parser === undefined ? false : v.defaultValue]),
    );

    const flagPreParse: { name: string; def: FlagDef; position: number }[] = [];
    let offset = 0;

    function getFlagName(shortcut: Char): string {
        const name = shortcuts.get(shortcut);
        if (name) return name;
        // TODO: raise error ?
        Logger.debug("TODO: unknow shortcut:", shortcut);
        throw new CommandResultError(CommandResultUtils.failParseFlagUnknown(shortcut));
    }

    function getFlagDef(name: string): FlagDef {
        const def = flagDefinitions.get(name);
        if (def) return def;
        // TODO: raise error ?
        Logger.debug("TODO: unknow flag :", name);
        throw new CommandResultError(CommandResultUtils.failParseFlagUnknown(name));
    }

    for (let i = 0; i < args.length; i++) {
        const a = args[i];

        if (a.startsWith("-")) {
            let name: string;
            if (a.startsWith("--")) {
                name = a.substr(2);
            } else {
                const shortNames = a.substring(1).split("") as Char[];
                const lastShort = shortNames.pop() as Char;

                shortNames.forEach(sn => {
                    const def = getFlagDef(getFlagName(sn));

                    if (def.parser) {
                        // TODO: raise error ?
                        Logger.debug("TODO: invalid flag value:", name);
                        throw new CommandResultError(CommandResultUtils.failParseFlagInvalid(def, ""));
                    }

                    flagValues.set(name, true);
                });

                name = getFlagName(lastShort);
            }

            const def = getFlagDef(name);

            flagPreParse.push({ name, def, position: i });
        }
    }

    for (let i = 0; i < flagPreParse.length; i++) {
        const cur = flagPreParse[i];
        const next = i < flagPreParse.length - 1 ? flagPreParse[i + 1] : undefined;

        const context = new ParsingContext(inputArguments, cur.position, next?.position);

        let value;
        try {
            value = cur.def.parser ? cur.def.parser._parse(context) : true;
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

        flagValues.set(cur.name, value);
        args.splice(cur.position, 1 + context.consumed);
    }

    return { flagValues, args };

    // function parse(index: number, flagName: string, flagValue?: string, dontUseNextArg?: boolean) {
    //     const flag = flagDefinitions.get(flagName);
    //     if (!flag) throw new CommandResultError(CommandResultUtils.failParseFlagUnknown(flagName));

    //     if (flagValue) {
    //         const parsed = parseValue(flag, message, flagValue);
    //         if (parsed.value === undefined)
    //             throw new CommandResultError(CommandResultUtils.failParseFlagInvalid(flag, flagValue), parsed.message);
    //         flagValues.set(flagName, parsed.value);
    //         args.splice(index, 1);
    //     } else {
    //         if (flag.type === "boolean") {
    //             flagValues.set(flagName, true);
    //             args.splice(index, 1);
    //         } else {
    //             if (dontUseNextArg || index + 1 >= args.length)
    //                 throw new CommandResultError(CommandResultUtils.failParseFlagInvalid(flag, ""));
    //             const parsed = parseValue(flag, message, args[index + 1]);
    //             if (parsed.value === undefined)
    //                 throw new CommandResultError(
    //                     CommandResultUtils.failParseFlagInvalid(flag, args[index + 1]),
    //                     parsed.message,
    //                 );
    //             flagValues.set(flagName, parsed.value);
    //             args.splice(index, 2);
    //         }
    //     }
    // }

    function parseFlag(name: string, hasValue: boolean): void {
        // TODO
        const def = flagDefinitions.get(name);
        if (def === undefined) {
            // TODO: raise error ?
            Logger.debug("TODO: unknow flag:", name);
            throw new CommandResultError(CommandResultUtils.failParseFlagUnknown(name));
        }

        if (def.parser) {
            if (!hasValue) {
                // TODO: raise error ?
                Logger.debug("TODO: flag require value:", name);
                throw new CommandResultError(CommandResultUtils.failParseFlagInvalid(def, ""));
            }
            try {
                const context = new ParsingContext([]); // TODO
                const value = def.parser._parse(context);
                flagValues.set(name, value);
            } catch (e) {
                if (e instanceof ParseError) {
                    // TODO
                    Logger.debug("TODO: catch parse error:", e);
                } else {
                    // TODO
                    Logger.debug("TODO: catch error while parsing:", e);
                }
            }
        } else {
            flagValues.set(name, true);
        }
    }

    function parseShort(shortName: Char, hasValue: boolean): void {
        const name = shortcuts.get(shortName);

        if (name === undefined) {
            // TODO: raise error ?
            Logger.debug("TODO: unknow shortcut:", shortName);
            throw new CommandResultError(CommandResultUtils.failParseFlagUnknown(shortName));
        } else {
            parseFlag(name, hasValue);
        }
    }

    // for (let i = 0; i < args.length; i++) {
    //     const a = args[i];

    //     if (a.match(/^--[^-].*$/)) {
    //         parseFlag(a.substring(2), true);
    //     } else if (a.match(/^-[a-zA-Z]$/)) {
    //         parseShort(a.substring(1) as Char, true);
    //     } else if (a.match(/^-[a-zA-Z]{2,}$/)) {
    //         const shortNames = a.substring(1).split("") as Char[];
    //         const lastShort = shortNames.pop() as Char;

    //         shortNames.forEach(s => parseShort(s, false));

    //         parseShort(lastShort, true);
    //     } else continue;
    //     i--;
    // }

    return { args, flagValues };
}
