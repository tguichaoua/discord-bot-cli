import { Localization } from "./localization/Localization";

export interface ParseOptions {
    /** The command prefix */
    prefix: string;
    /** If set to true, display help about command if not signature has been found. (default is true) */
    helpOnSignatureNotFound: boolean;
    /** A list of discord user Id of dev */
    devIDs: readonly string[];
    /** A localization object */
    localization: Localization;
    /** The number of command per page are displayed by the builin list command. (default is 5) */
    listCommandPerPage: number;
}