import { FlagData } from "../../commands";

export interface FlagRawHelp {
    readonly flag: FlagData;
    readonly typeName?: string;
    readonly localizedName: string;
    readonly description: string;
    readonly longUsageString?: string;
    readonly shortUsageString?: string;
}
