import { User } from "discord.js";
import { CommandDefinition } from "../definition/CommandDefinition";
import { CommandExecuteData } from "../data/CommandExecuteData";

export type CanUseCommandCb<T extends CommandDefinition = CommandDefinition> = (user: User, data: CommandExecuteData<T>) => boolean | string;