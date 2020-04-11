import { CommandResultStatus } from "./CommandResultStatus";
import Command from "./Command";
import Signature from "./Signature";

export interface CommandResult {
    status: CommandResultStatus;
    command?: Command,
    signature?: Signature,
    result?: any,
    error?: any,
}

export function ok(command: Command, signature: Signature, result: any): CommandResult {
    return { status: CommandResultStatus.OK, command, signature, result };
}

export function error(error: any): CommandResult {
    return { status: CommandResultStatus.ERROR, error };
}

export function devOnly(): CommandResult {
    return { status: CommandResultStatus.DEV_ONLY };
}

export function notPrefixed(): CommandResult {
    return { status: CommandResultStatus.NOT_PREFIXED };
}

export function signatureNotFound(command: Command): CommandResult {
    return { status: CommandResultStatus.SIGNATURE_NOT_FOUND, command };
}

export function commandNotFound(): CommandResult {
    return { status: CommandResultStatus.COMMAND_NOT_FOUND };
}