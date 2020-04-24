import { SignatureDef } from "./SignatureDef";
import { CommandSet } from "..";

export interface CommandDef {
    description: string;
    signatures?: SignatureDef[];
    subs?: { [name: string]: CommandDef };

    onInit: (context: any, commandSet: CommandSet) => void | Promise<void>;

    inherit?: boolean;
    ignore?: boolean;
    keepCommandMessage?: boolean;
    dev?: boolean;
}