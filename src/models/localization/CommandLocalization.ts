import { ParsableLocalization } from "./ParsableLocalization";

export interface CommandLocalization {
    name?: string;
    description?: string;
    rest?: { name: string; description: string };
    args?: { [name: string]: ParsableLocalization };
    flags?: { [name: string]: ParsableLocalization };
    subs?: { [name: string]: CommandLocalization };
}