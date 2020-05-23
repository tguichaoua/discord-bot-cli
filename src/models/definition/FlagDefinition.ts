import { ParsableDefinition } from "./ParsableDefinition";
import { Char } from "../../utils/char";

export type FlagDefinition = ParsableDefinition &
{
    /** Shortcut version of the flag. */
    shortcut?: Char;
};