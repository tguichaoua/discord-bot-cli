import { ParsableDefinition } from "./ParsableDefinition";
import { Char } from "../../utils/char";

/** @category Definition */
export type FlagDefinition = ParsableDefinition & {
    /** Shortcut version of the flag. */
    readonly shortcut?: Char;
};
