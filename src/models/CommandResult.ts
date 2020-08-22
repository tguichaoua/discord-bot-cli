import { Command } from "./Command";
import { ArgDefinition } from "./definition/ArgDefinition";
import { FlagDefinition } from "./definition/FlagDefinition";

export type CommandResult =
    | {
          readonly status: "ok";
          readonly command: Command;
          readonly result: any;
      }
    | {
          readonly status: "error";
          readonly error: any;
      }
    | {
          readonly status:
              | "no executor"
              | "guild only"
              | "dev only"
              | "unauthorized user"
              | "throttling"
              | "client permissions";
          readonly command: Command;
      }
    | {
          readonly status: "not prefixed" | "command not found";
      }
    | ({
          readonly status: "parsing error";
      } & (
          | ({
                readonly type: "arg";
                readonly arg: Readonly<ArgDefinition>;
            } & (
                | {
                      readonly reason: "invalid value";
                      readonly got: string;
                  }
                | {
                      readonly reason: "missing argument";
                  }
            ))
          | ({
                readonly type: "flag";
            } & (
                | {
                      readonly reason: "unknown flag";
                      readonly name: string;
                  }
                | {
                      readonly reason: "invalid value";
                      readonly flag: Readonly<FlagDefinition>;
                      readonly got: string;
                  }
            ))
      ));

/** @internal */
export const CommandResultUtils = Object.freeze({
    ok(command: Command, result: any): CommandResult {
        return { status: "ok", command, result };
    },
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
    failParseArgInvalid(
        arg: Readonly<ArgDefinition>,
        got: string
    ): CommandResult {
        return {
            status: "parsing error",
            type: "arg",
            arg,
            reason: "invalid value",
            got,
        };
    },
    failParseArgMissing(arg: Readonly<ArgDefinition>): CommandResult {
        return {
            status: "parsing error",
            type: "arg",
            arg,
            reason: "missing argument",
        };
    },
    failParseFlagUnknown(name: string): CommandResult {
        return {
            status: "parsing error",
            type: "flag",
            reason: "unknown flag",
            name,
        };
    },
    failParseFlagInvalid(
        flag: Readonly<FlagDefinition>,
        got: string
    ): CommandResult {
        return {
            status: "parsing error",
            type: "flag",
            flag,
            reason: "invalid value",
            got,
        };
    },
});
