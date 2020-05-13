import { ParsableDef } from "./ParsableDef";
export type ArgDef = ParsableDef & {
    /** If set to true, this argument can be omitted. In this case defaultValue is used. (default is false) */
    optional?: boolean
};