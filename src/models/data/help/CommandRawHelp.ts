import { Command } from "../../Command";
import { ArgumentRawHelp } from "./ArgumentRawHelp";
import { FlagRawHelp } from "./FlagRawHelp";
import { RestRawHelp } from "./RestRawHelp";

export interface CommandRawHelp {
    readonly command: Command;
    readonly fullName: string;
    readonly aliases: string[];
    readonly description: string;
    readonly args: ArgumentRawHelp[];
    readonly flags: FlagRawHelp[];
    readonly subs: CommandRawHelp[];
    readonly rest?: RestRawHelp;
}