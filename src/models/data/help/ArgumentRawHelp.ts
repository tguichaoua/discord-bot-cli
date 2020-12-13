import { ArgDef } from "../../definition/ArgDefinition";

export interface ArgumentRawHelp {
    readonly arg: ArgDef;
    readonly typeNames: string[];
    readonly name: string;
    readonly localizedName: string;
    readonly description: string;
    readonly usageString: string;
}
