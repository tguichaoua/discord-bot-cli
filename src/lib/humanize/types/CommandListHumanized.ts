import { Command } from "../../command";

export interface CommandListHumanized {
    readonly command: Command;
    readonly description: string;
}
