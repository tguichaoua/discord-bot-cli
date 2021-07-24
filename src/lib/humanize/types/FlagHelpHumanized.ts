import { FlagData } from "../../command";

export interface FlagHelpHumanized {
    readonly flag: FlagData;
    readonly typeName?: string;
    readonly localizedName: string;
    readonly description: string;
    readonly longUsageString?: string;
    readonly shortUsageString?: string;
}
