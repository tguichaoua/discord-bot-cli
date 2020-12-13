import { FlagDef } from "../../definition/FlagDefinition";

export interface FlagRawHelp {
    readonly flag: FlagDef;
    readonly typeNames: string[];
    readonly name: string;
    readonly localizedName: string;
    readonly description: string;
    readonly longUsageString: string;
    readonly shortUsageString?: string;
}
