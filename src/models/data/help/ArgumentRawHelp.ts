import { ArgDefinition } from "../../definition/ArgDefinition";

export interface ArgumentRawHelp {
    readonly arg: ArgDefinition;
    readonly typeName: string;
    readonly name: string;
    readonly localizedName: string;
    readonly description: string;
    readonly usageString: string;
}