import { Command } from "../../Command";
import { ArgumentRawHelp } from "./ArgumentRawHelp";
import { FlagRawHelp } from "./FlagRawHelp";

export interface CommandRawHelp {
    readonly command: Command;
    readonly fullName: string;
    readonly aliases: string[];
    readonly description: string;
    readonly tags: string[];
    readonly args: ArgumentRawHelp[];
    readonly flags: FlagRawHelp[];
    readonly subs: CommandRawHelp[];
}
