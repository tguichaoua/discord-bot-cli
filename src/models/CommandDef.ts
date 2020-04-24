import { SignatureDef } from "./SignatureDef";

export interface CommandDef {
    description: string;
    signatures?: SignatureDef[];
    subs?: { [name: string]: CommandDef };
}