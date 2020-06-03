import { CommandLocalization } from "./CommandLocalization";
import { TypeNameLocalization } from "./TypeNameLocalization";

export interface Localization {
    typeNames: TypeNameLocalization;
    help: {
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