import { LocalizationResolver } from "../localization";

export interface CommandManagerOptions {
    /** The command prefix. */
    prefix: string;
    /** A list of the bot's owner's discord ID.  */
    ownerIDs: readonly string[];
    /** Either or not a mention to the bot can be used instead of a prefix (default is `false`). */
    allowMentionAsPrefix: boolean;
    /** Either or not owner users are not subject to permissions checking (default is `false`). */
    skipOwnerPermissionsChecking: boolean;
    /** Either or not the unknown flags are ignored at parsing (default is `false`). */
    ignoreUnknownFlags: boolean;
    /** Return the appropriate localization based on the guild member or the user that performs the command. */
    localizationResolver?: LocalizationResolver;
}
