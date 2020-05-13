import { Char } from "../../utils/char"
import { ParsableDef } from "./ParsableDef";

export type FlagDef = ParsableDef & {
    /** Shortcut version of the flag. */
    shortcut?: Char
};