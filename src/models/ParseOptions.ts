import { Localization } from "./localization/Localization";
import { ListQuery } from "./query/ListQuery";
import { HelpQuery } from "./query/HelpQuery";

export interface ParseOptions {
    /** The command prefix */
    prefix: string;
    /** If set to true, display help about command if not signature has been found. (default is true) */
    helpOnSignatureNotFound: boolean;
    /** If set to true, the message is automatically deleted if not command is found. (default is true) */
    deleteMessageIfCommandNotFound: boolean;
    /** A list of discord user Id of dev */
    devIDs: readonly string[];
    /** A localization object */
    localization: Localization;
    /** The number of command per page are displayed by the builin list command. (default is 5) */
    listCommandPerPage: number;
    /** A function to override the default behaviour of buildin help command. */
    help?: (query: HelpQuery) => any | Promise<any>;
    /** A function to override the default behaviour of buildin list command. */
    list?: (query: ListQuery) => any | Promise<any>;
}