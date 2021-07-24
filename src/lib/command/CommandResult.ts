import { ArgItem } from "arg-analyser";

import { ParseError } from "../parser";

import { Command } from "./Command";
import { FlagData } from "./FlagData";

interface __Error {
    readonly status: "error";
    readonly error: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface __Command {
    readonly status:
        | "ok"
        | "no executor"
        | "guild only"
        | "dev only"
        | "unauthorized user"
        | "throttling"
        | "client permissions";
    readonly command: Command;
}

interface __NoData {
    readonly status: "not prefixed" | "command not found";
}

interface __ParsingError {
    readonly status: "parsing error";
    readonly inputs: readonly ArgItem[];
    readonly position: number;
}

interface __UnknownFlag extends __ParsingError {
    readonly reason: "unknown flag";
    readonly name: string;
}

interface __WrongFlagUsage extends __ParsingError {
    readonly reason: "wrong flag usage";
    readonly name: string;
    readonly flag: FlagData;
}

interface __ErrorParsingError extends __ParsingError {
    readonly reason: "error";
    readonly error: ParseError;
}

export type CommandResult = __Error | __Command | __NoData | __UnknownFlag | __WrongFlagUsage | __ErrorParsingError;

/** @internal */
export const CommandResultUtils = Object.freeze({
    ok(command: Command): CommandResult {
        return { status: "ok", command };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(error: any): CommandResult {
        return { status: "error", error };
    },
    noExecutor(command: Command): CommandResult {
        return { status: "no executor", command };
    },
    devOnly(command: Command): CommandResult {
        return { status: "dev only", command };
    },
    guildOnly(command: Command): CommandResult {
        return { status: "guild only", command };
    },
    unauthorizedUser(command: Command): CommandResult {
        return { status: "unauthorized user", command };
    },
    throttling(command: Command): CommandResult {
        return { status: "throttling", command };
    },
    clientPermissions(command: Command): CommandResult {
        return { status: "client permissions", command };
    },
    notPrefixed(): CommandResult {
        return { status: "not prefixed" };
    },
    commandNotFound(): CommandResult {
        return { status: "command not found" };
    },
    unknownFlag(inputs: readonly ArgItem[], position: number, name: string): CommandResult {
        return { status: "parsing error", reason: "unknown flag", inputs, position, name };
    },
    wrongFlagUsage(inputs: readonly ArgItem[], position: number, name: string, flag: FlagData): CommandResult {
        return { status: "parsing error", reason: "wrong flag usage", inputs, position, name, flag };
    },
    parseError(inputs: readonly ArgItem[], position: number, error: ParseError): CommandResult {
        return { status: "parsing error", reason: "error", inputs, position, error };
    },
});
