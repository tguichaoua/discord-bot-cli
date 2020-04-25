import { Char } from "../../utils/char"
import {  ParsableDef } from "./ParsableDef";

export type FlagDef = ParsableDef & { shortcut?: Char };