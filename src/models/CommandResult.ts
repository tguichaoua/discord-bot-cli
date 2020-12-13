import { Command } from "./Command";
import { ArgDef } from "./definition/ArgDefinition";
import { FlagDef } from "./definition/FlagDefinition";

export type CommandResult =
    | {
          readonly status: "error";
          readonly error: any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    | {
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
    | {
          readonly status: "not prefixed" | "command not found";
      }
    | ({
          readonly status: "parsing error";
      } & (
          | ({
                readonly type: "arg";
                readonly arg: Readonly<ArgDef>;
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
                      readonly flag: Readonly<FlagDef>;
                      readonly got: string;
                  }
            ))
      ));

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
    failParseArgInvalid(arg: Readonly<ArgDef>, got: string): CommandResult {
        return {
            status: "parsing error",
            type: "arg",
            arg,
            reason: "invalid value",
            got,
        };
    },
    failParseArgMissing(arg: Readonly<ArgDef>): CommandResult {
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
    failParseFlagInvalid(flag: Readonly<FlagDef>, got: string): CommandResult {
        return {
            status: "parsing error",
            type: "flag",
            flag,
            reason: "invalid value",
            got,
        };
    },
});
