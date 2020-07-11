import { Message, Guild, GuildMember } from "discord.js";
import { CommandSet } from "../CommandSet";

import {
    CommandDefinition,
    CommandSettings,
} from "../definition/CommandDefinition";
import { ParsableTypeOf } from "../ParsableType";
import { ParseOptions } from "../ParseOptions";
import { Command } from "../Command";

type IsGuildOnly<S extends CommandSettings> = S["guildOnly"] extends true
    ? never
    : null;

export type CommandExecutor<
    T extends CommandDefinition = CommandDefinition,
    S extends CommandSettings = {}
> = (
    args: {
        readonly [name in keyof T["args"]]:
            | ParsableTypeOf<NonNullable<T["args"]>[name]["type"]>
            | (NonNullable<T["args"]>[name]["optional"] extends true
                  ? undefined extends NonNullable<
                        T["args"]
                    >[name]["defaultValue"]
                      ? undefined
                      : NonNullable<T["args"]>[name]["defaultValue"]
                  : never);
    },
    flags: {
        readonly [name in keyof T["flags"]]:
            | ParsableTypeOf<NonNullable<T["flags"]>[name]["type"]>
            | (undefined extends NonNullable<T["flags"]>[name]["defaultValue"]
                  ? undefined
                  : NonNullable<T["flags"]>[name]["defaultValue"]);
    },
    others: {
        readonly rest: undefined extends T["rest"]
            ? void
            : readonly ParsableTypeOf<NonNullable<T["rest"]>["type"]>[];
        readonly message: Message & {
            readonly guild: Guild | IsGuildOnly<S>;
            readonly member: GuildMember | IsGuildOnly<S>;
        };
        readonly guild: Guild | IsGuildOnly<S>;
        readonly member: GuildMember | IsGuildOnly<S>;
        readonly options: ParseOptions;
        readonly commandSet: CommandSet;
        readonly command: Command;
    }
) => any | Promise<any>;
