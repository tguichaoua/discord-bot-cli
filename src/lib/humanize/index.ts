import { commandFullName, commandRawHelp } from "./help";
import { getListRawData } from "./list";

export * from "./types";

export const humanize = Object.freeze({
    commandFullName,
    commandRawHelp,
    getListRawData,
});
