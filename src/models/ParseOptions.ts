import { Localization } from "./Localization";
import { ListQuery } from "./query/ListQuery";
import { HelpQuery } from "./query/HelpQuery";

export interface ParseOptions {
    prefix: string;
    helpOnSignatureNotFound: boolean;
    deleteMessageIfCommandNotFound: boolean;
    devIDs: readonly string[];
    localization: Localization;
    help?: (query: HelpQuery) => any | Promise<any>;
    list?: (query: ListQuery) => any | Promise<any>;
    listCommandPerPage: number;
}