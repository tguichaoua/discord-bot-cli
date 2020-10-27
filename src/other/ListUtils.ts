import { CommandSet } from "../models/CommandSet";
import { ListRawData } from "../models/data/list/RawList";
import { Command } from "../models/Command";
import { CommandRawList } from "../models/data/list/CommandRawList";
import { Localization } from "../models/localization/Localization";

/**
 * Extracts raw data for list command.
 * @category Utils
 * @param commandSet
 * @param localization
 * @returns List command raw datas.
 */
export function getListRawData(commandSet: CommandSet, localization: Localization): ListRawData {
    const commands = Array.from(commandSet.commands)
        .sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        })
        .map(c => getCommandRaw(c, localization));

    return { commands };
}

/** @internal */
function getCommandRaw(command: Command, localization: Localization): CommandRawList {
    const description = localization.commands[command.name]?.description ?? command.description;

    return { command, description };
}
