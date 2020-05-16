import { Command } from "./Command";
import { Signature } from "./Signature";

export type CommandResult =
    {
        status: "ok",
        command: Command,
        signature: Signature,
        result: any
    } |
    {
        status: "error",
        error: any,
    } |
    {
        status: "signature not found" | "guild only" | "dev only",
        command: Command,
    } |
    {
        status: "not prefixed" | "command not found"
    };

/** @ignore */
export function ok(command: Command, signature: Signature, result: any): CommandResult {
    return { status: "ok", command, signature, result };
}

/** @ignore */
export function error(error: any): CommandResult {
    return { status: "error", error };
}

/** @ignore */
export function devOnly(command: Command): CommandResult {
    return { status: "dev only", command };
}

/** @ignore */
export function guildOnly(command: Command): CommandResult {
    return { status: "guild only", command };
}

/** @ignore */
export function notPrefixed(): CommandResult {
    return { status: "not prefixed" };
}

/** @ignore */
export function signatureNotFound(command: Command): CommandResult {
    return { status: "signature not found", command };
}

/** @ignore */
export function commandNotFound(): CommandResult {
    return { status: "command not found" };
}