import { ArgDefinition } from "../../command";

export interface ArgumentHelpHumanized {
    readonly arg: ArgDefinition;
    readonly typeName: string;
    readonly name: string;
    readonly localizedName: string;
    readonly description: string;
    readonly usageString: string;
}
