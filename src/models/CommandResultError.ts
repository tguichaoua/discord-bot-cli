import { CommandResult } from "./CommandResult";

/** @internal */
export class CommandResultError extends Error {
    constructor(public readonly commandResult: CommandResult) {
        super("This error is used internally by discord-bot-cli. It must not been shown in the console. If it's the case, it's a bug.");
        this.name = "CommandResultError";
    }
}