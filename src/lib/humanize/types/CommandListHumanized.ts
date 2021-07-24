import { Command } from "../../commands";

export interface CommandListHumanized {
    readonly command: Command;
    readonly description: string;
}
