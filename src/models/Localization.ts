import { ParsableTypeName } from "./ParsableType";

export interface Localization {
    typeNames: { [type in ParsableTypeName]: string };
    help: {
        default: string;
        commandNotFound: string;
    };
    list: {
        invalidPage: string;
    };
}