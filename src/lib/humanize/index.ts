import { commandFullName, commandHelp } from "./help";
import { commandList } from "./list";

export * from "./types";

export const humanize = Object.freeze({
    commandFullName,
    commandRawHelp: commandHelp,
    getListRawData: commandList,
});
