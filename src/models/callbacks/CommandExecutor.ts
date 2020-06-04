import { Message, Guild, GuildMember } from "discord.js";
import { CommandSet } from "../CommandSet";

import { CommandDefinition } from "../definition/CommandDefinition";
import { ParsableTypeOf } from "../ParsableType";
import { ParseOptions } from "../ParseOptions";

export type CommandExecutor<T extends CommandDefinition = CommandDefinition> =
    (
        args: { readonly [name in keyof T["args"]]: (
            ParsableTypeOf<NonNullable<T["args"]>[name]["type"]>
            | (
                NonNullable<T["args"]>[name]["optional"] extends true ? undefined extends NonNullable<T["args"]>[name]["defaultValue"] ?
                undefined : never : never
            )
        ) },
        flags: { readonly [name in keyof T["flags"]]: (
            ParsableTypeOf<NonNullable<T["flags"]>[name]["type"]>
            | (undefined extends NonNullable<T["flags"]>[name]["defaultValue"] ? undefined : never)
        )
        },
        others: {
            readonly rest: string[];
            readonly message: Message & {
                readonly guild: Guild | (T["guildOnly"] extends true ? never : null);
                readonly member: GuildMember | (T["guildOnly"] extends true ? never : null);
            };
            readonly guild: Guild | (T["guildOnly"] extends true ? never : null);
            readonly member: GuildMember | (T["guildOnly"] extends true ? never : null);
            readonly options: ParseOptions;
            readonly commandSet: CommandSet;
        }
    ) => any | Promise<any>;