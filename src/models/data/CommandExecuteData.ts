import { Message, Guild } from "discord.js";
import { CommandDefinition } from "../definition/CommandDefinition";
import { ParseOptions } from "querystring";
import { CommandSet } from "../..";

export interface CommandExecuteData<T extends CommandDefinition = CommandDefinition> {
    message: Message & { guild: Guild | (T["guildOnly"] extends true ? never : null) };
    guild: Guild | (T["guildOnly"] extends true ? never : null);
    options: ParseOptions;
    commandSet: CommandSet;
}