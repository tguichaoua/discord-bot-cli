import { Localization } from "./Localization";

export interface ParseOptions {
    prefix: string;
    helpOnSignatureNotFound: boolean;
    deleteMessageIfCommandNotFound: boolean;
    devIDs: readonly string[];
    localization: Localization;
}