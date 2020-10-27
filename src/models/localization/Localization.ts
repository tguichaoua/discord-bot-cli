import { CommandLocalization } from "./CommandLocalization";
import { TypeNameLocalization } from "./TypeNameLocalization";

/**
 * See [localization.json](https://github.com/tguichaoua/discord-bot-cli/blob/master/src/data/localization.json) for default localization.
 * @category Localization
 */
export interface Localization {
    typeNames: TypeNameLocalization;
    /** Localization used by the build-in command `help`. */
    help: {
        tags: {
            guildOnly: string;
            devOnly: string;
        };
        usage: string;
        arguments: string;
        flags: string;
        subCommands: string;
        aliases: string;
        examples: string;
        bot_permissions: string;
        user_permissions: string;
        default: string;
        commandNotFound: string;
        restTypeName: string;
        argUsageHint: string;
    };
    /** Localization used by the build-in command `list`. */
    list: {
        title: string;
    };
    /**
     * Localization for user-defined commands.
     * If set, localization values will override command definition values.
     */
    commands: Record<string, CommandLocalization>;
    misc: {
        guildOnlyWarning: string;
    };
}
