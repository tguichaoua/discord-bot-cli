import { ParsableLocalization } from "./ParsableLocalization";

/**
 * @category Localization
 */
export interface CommandLocalization {
    description?: string;
    rest?: { name: string; description: string };
    args?: Record<string, ParsableLocalization>;
    flags?: Record<string, ParsableLocalization>;
    subs?: Record<string, CommandLocalization>;
}
