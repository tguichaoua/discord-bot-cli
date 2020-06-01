import { Command } from "./Command";
import { ArgDefinition } from "./definition/ArgDefinition";
import { FlagDefinition } from "./definition/FlagDefinition";

export type CommandResult =
    {
        readonly status: "ok";
        readonly command: Command;
        readonly result: any;
    } |
    {
        readonly status: "error";
        readonly error: any;
    } |
    {
        readonly status: "no executor" | "guild only" | "dev only";
        readonly command: Command;
    } |
    {
        readonly status: "not prefixed" | "command not found";
    } |
    (
        {
            readonly status: "parsing error";
        } &
        (
            (
                {
                    readonly type: "arg";
                    readonly arg: Readonly<ArgDefinition>;
                } &
                (
                    {
                        readonly reason: "invalid value";
                        readonly got: string;
                    } |
                    {
                        readonly reason: "missing argument";
                    }
                )
            ) |
            (
                {
                    readonly type: "flag";
                } &
                (
                    {
                        readonly reason: "unknown flag";
                        readonly name: string;
                    } |
                    {
                        readonly reason: "invalid value";
                        readonly flag: Readonly<FlagDefinition>;
                        readonly got: string;
                    }
                )
            )
        )
    );


/** @internal */
export namespace CommandResultUtils {
    /** @internal */
    export function ok(command: Command, result: any): CommandResult { return { status: "ok", command, result }; }

    /** @internal */
    export function error(error: any): CommandResult { return { status: "error", error }; }

    /** @internal */
    export function noExecutor(command: Command): CommandResult { return { status: "no executor", command }; }

    /** @internal */
    export function devOnly(command: Command): CommandResult { return { status: "dev only", command }; }

    /** @internal */
    export function guildOnly(command: Command): CommandResult { return { status: "guild only", command }; }

    /** @internal */
    export function notPrefixed(): CommandResult { return { status: "not prefixed" }; }

    /** @internal */
    export function commandNotFound(): CommandResult { return { status: "command not found" }; }

    /** @internal */
    export function failParseArgInvalid(arg: Readonly<ArgDefinition>, got: string): CommandResult { return { status: "parsing error", type: "arg", arg, reason: "invalid value", got }; }

    /** @internal */
    export function failParseArgMissing(arg: Readonly<ArgDefinition>): CommandResult { return { status: "parsing error", type: "arg", arg, reason: "missing argument" }; }

    /** @internal */
    export function failParseFlagUnknown(name: string): CommandResult { return { status: "parsing error", type: "flag", reason: "unknown flag", name }; }

    /** @internal */
    export function failParseFlagInvalid(flag: Readonly<FlagDefinition>, got: string): CommandResult { return { status: "parsing error", type: "flag", flag, reason: "invalid value", got }; }

}