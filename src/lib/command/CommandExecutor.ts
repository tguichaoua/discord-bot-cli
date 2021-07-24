import { Message, DMChannel } from "discord.js";
import { ArgItem } from "arg-analyser";

import { ParserType } from "../parser";
import { CommandDefinition, CommandSettings } from "./definitions";

import { CommandSetOptions } from "./CommandSetOptions";
import { CommandSet } from "./CommandSet";
import { Command } from "./Command";

/** @ignore */
type IsGuildOnly<S extends CommandSettings, True, False> = S["guildOnly"] extends true ? True : False;

/** @ignore */
type MessageExtension<S> = {
    readonly guild: IsGuildOnly<S, NonNullable<Message["guild"]>, Message["guild"]>;
    readonly member: IsGuildOnly<S, NonNullable<Message["member"]>, Message["member"]>;
    readonly channel: IsGuildOnly<S, Exclude<Message["channel"], DMChannel>, Message["channel"]>;
};

/**
 * Command's executor handler.
 * @category Handler
 */
export type CommandExecutor<
    T extends CommandDefinition = CommandDefinition,
    S extends CommandSettings = Record<string, unknown>,
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
        readonly message: Message & MessageExtension<S>;
        readonly options: CommandSetOptions;
        readonly commandSet: CommandSet;
        readonly command: Command;
    } & MessageExtension<S>,
) => void | Promise<void>;
