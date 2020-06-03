import { CommandLocalization } from "./CommandLocalization";
import { TypeNameLocalization } from "./TypeNameLocalization";

export interface Localization {
    typeNames: TypeNameLocalization;
    help: {
        usage: string;
        arguments: string;
        flags: string;
        subCommands: string;
        aliases: string;
        default: string;
        commandNotFound: string;
        guildOnlyTag: string;
    };
    list: {
        title: string;
    };
    commands: { [name: string]: CommandLocalization };
    misc: {
        guildOnlyWarning: string;
    };
}