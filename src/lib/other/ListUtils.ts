import { CommandSet } from "../models/CommandSet";
import { ListRawData } from "../models/data/list/RawList";
import { Command } from "../models/Command";
import { CommandRawList } from "../models/data/list/CommandRawList";
import { Localizator } from "../models/localization";

/**
 * Extracts raw data for list command.
 * @category Utils
 * @param commandSet
 * @param localization
 * @returns List command raw datas.
 */
export function getListRawData(commandSet: CommandSet, localizator: Localizator): ListRawData {
    const commands = Array.from(commandSet.commands)
        .sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        })
        .map(c => getCommandRaw(c, localizator));

    return { commands };
}

/** @internal */
function getCommandRaw(command: Command, localizator: Localizator): CommandRawList {
    const description = localizator.getCommand(command).description;
    return { command, description };
}
