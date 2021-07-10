import { FlagDefinition } from "../../definition/FlagDefinition";

export interface FlagRawHelp {
    readonly flag: FlagDefinition;
    readonly typeName: string;
    readonly name: string;
    readonly localizedName: string;
    readonly description: string;
    readonly longUsageString: string;
    readonly shortUsageString?: string;
}
