import { Message } from "discord.js";
import { CommandSet } from "../CommandSet";

import { CommandDefinition } from "../definition/CommandDefinition";
import { CommandSetOptions } from "../CommandSetOptions";
import { Command } from "../Command";
import { ParserType } from "../parsers";
import { ArgItem } from "arg-analyser";
import { CommandGuard, CommandGuardTuple } from "../guards";
import { UnionToIntersection } from "../../utils/types";

/**
 * Command's executor handler.
 * @category Handler
 */
export type CommandExecutor<
    T extends CommandDefinition = CommandDefinition,
    Guards extends CommandGuardTuple = never,
> = (
    args: {
        readonly [name in keyof T["args"]]:
            | ParserType<NonNullable<T["args"]>[name]["parser"]>
            | (NonNullable<T["args"]>[name]["optional"] extends true
                  ? undefined extends NonNullable<T["args"]>[name]["defaultValue"]
                      ? undefined
                      : NonNullable<T["args"]>[name]["defaultValue"]
                  : never);
    },
    flags: {
        readonly [name in keyof T["flags"]]: undefined extends NonNullable<T["flags"]>[name]["parser"]
            ? number
            :
                  | ParserType<NonNullable<NonNullable<T["flags"]>[name]["parser"]>>
                  | (undefined extends NonNullable<T["flags"]>[name]["defaultValue"]
                        ? undefined
                        : NonNullable<T["flags"]>[name]["defaultValue"]);
    },
    others: {
        readonly rest: ArgItem[];
        readonly message: Message;
        readonly options: CommandSetOptions;
        readonly commandSet: CommandSet;
        readonly command: Command;
    },
    guards: UnknownToNever<UnionToIntersection<CommandGuard_Tuple2Object<Guards>>>,
    // guards2: CommandGuard_Tuple2Object<Guards>,
    // guards3: Guards,
) => void | Promise<void>;

type CommandGuard_Tuple2Object<T extends CommandGuardTuple> = T extends readonly [unknown, infer K, infer G]
    ? K extends string
        ? G extends CommandGuard<infer V>
            ? { [k in K]: V }
            : never
        : never
    : never;

type UnknownToNever<T> = unknown extends T ? never : T;
