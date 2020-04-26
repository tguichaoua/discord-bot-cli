import {Command} from "./Command";
import {Signature} from "./Signature";

export type CommandResult = 
{
    status:"ok",
    command: Command,
    signature: Signature,
    result: any
} |
{
    status: "error",
    error: any,
} |
{
    status: "signature not found",
    command: Command,
} |
{
    status: "dev only" | "not prefixed" | "command not found"
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
export function devOnly(): CommandResult {
    return { status: "dev only" };
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