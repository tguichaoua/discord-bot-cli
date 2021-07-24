import { Command } from "../../command";

import { ArgumentHelpHumanized } from "./ArgumentHelpHumanized";
import { FlagHelpHumanized } from "./FlagHelpHumanized";

export interface CommandHelpHumanized {
    readonly command: Command;
    readonly fullName: string;
    readonly aliases: string[];
    readonly description: string;
    readonly tags: string[];
    readonly args: ArgumentHelpHumanized[];
    readonly flags: FlagHelpHumanized[];
    readonly subs: CommandHelpHumanized[];
}
