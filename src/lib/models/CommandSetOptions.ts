import { Localization } from "./localization/Localization";

export interface CommandSetOptions {
    /** The command prefix. */
    prefix: string;
    /** A list of dev's discord ID.  */
    devIDs: readonly string[];
    /** A localization object. */
    localization: Localization;
    /** Either or not a mention to the bot can be used instead of a prefix (default is `false`). */
    allowMentionAsPrefix: boolean;
    /** Either or not dev users are not subject to permissions checking (default is `false`). */
    skipDevsPermissionsChecking: boolean;
    /** Either or not the unknown flags are ignored at parsing (default is `false`). */
    ignoreUnknownFlags: boolean;
}
