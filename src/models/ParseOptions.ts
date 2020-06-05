import { Localization } from "./localization/Localization";

export interface ParseOptions {
    /** The command prefix */
    prefix: string;
    /** A list of discord user Id of dev */
    devIDs: readonly string[];
    /** A localization object */
    localization: Localization;
}