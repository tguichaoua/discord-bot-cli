import Command from "./Command";
import Signature from "./Signature";

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

export function ok(command: Command, signature: Signature, result: any): CommandResult {
    return { status: "ok", command, signature, result };
}

export function error(error: any): CommandResult {
    return { status: "error", error };
}

export function devOnly(): CommandResult {
    return { status: "dev only" };
}

export function notPrefixed(): CommandResult {
    return { status: "not prefixed" };
}

export function signatureNotFound(command: Command): CommandResult {
    return { status: "signature not found", command };
}

export function commandNotFound(): CommandResult {
    return { status: "command not found" };
}