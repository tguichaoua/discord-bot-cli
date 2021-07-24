import { Command, CommandSet } from "../commands";
import { Localizator } from "../localization";

import { CommandListHumanized, CommandListDataHumanized } from "./types";

/**
 * Extracts raw data for list command.
 * @category Utils
 * @param commandSet
 * @param localization
 * @returns List command raw datas.
 */
export function commandList(commandSet: CommandSet, localizator: Localizator): CommandListDataHumanized {
    const commands = Array.from(commandSet.commands)
        .sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        })
        .map(c => getCommandList(c, localizator));

    return { commands };
}

/** @internal */
function getCommandList(command: Command, localizator: Localizator): CommandListHumanized {
    const description = localizator.getCommand(command).description;
    return { command, description };
}
