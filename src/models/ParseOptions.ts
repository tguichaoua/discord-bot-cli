import { Localization } from "./localization/Localization";

export interface CommandSetOptions {
    /** The command prefix. */
    prefix: string;
    /** A list of dev's discord ID.  */
    devIDs: readonly string[];
    /** A localization object. */
    localization: Localization;
    /** If set to `true`, a mention to the bot can be used instead of a prefix (default is `false`). */
    allowMentionAsPrefix: boolean;
    /** If set to `true`, users with dev privileges are not subject to permissions checking (default is `false`). */
    skipDevsPermissionsChecking: boolean;
}
