import { ParsableLocalization } from "./ParsableLocalization";

/**
 * @category Localization
 */
export interface CommandLocalization {
    description?: string;
    rest?: { name: string; description: string };
    args?: { [name: string]: ParsableLocalization };
    flags?: { [name: string]: ParsableLocalization };
    subs?: { [name: string]: CommandLocalization };
}
