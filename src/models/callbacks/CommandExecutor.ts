import { Message, Guild } from "discord.js";
import { CommandSet } from "../CommandSet";

import { CommandDefinition } from "../definition/CommandDefinition";
import { ParsableTypeOf } from "../ParsableType";
import { ParseOptions } from "../ParseOptions";
import { CommandExecuteData } from "../data/CommandExecuteData";

export type CommandExecutor<T extends CommandDefinition> =
    (
        args: { [name in keyof T["args"]]: (
            ParsableTypeOf<NonNullable<T["args"]>[name]["type"]>
            | (
                NonNullable<T["args"]>[name]["optional"] extends true ? undefined extends NonNullable<T["args"]>[name]["defaultValue"] ?
                undefined : never : never
            )
        ) },
        flags: { [name in keyof T["flags"]]: (
            ParsableTypeOf<NonNullable<T["flags"]>[name]["type"]>
            | (undefined extends NonNullable<T["flags"]>[name]["defaultValue"] ? undefined : never)
        )
        },
        others: { rest: string[]; } & CommandExecuteData<T>
    ) => any | Promise<any>;