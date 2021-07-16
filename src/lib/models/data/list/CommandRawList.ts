import { Command } from "../../Command";

export interface CommandRawList {
    readonly command: Command;
    readonly description: string;
}
