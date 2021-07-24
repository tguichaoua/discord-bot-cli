import { Command } from "../../commands";

export interface CommandRawList {
    readonly command: Command;
    readonly description: string;
}
