import { ParsableDefinition } from "./ParsableDefinition";

export type ArgDefinition = ParsableDefinition & {
    /** If set to true, this argument can be omitted. In this case defaultValue is used. (default is false) */
    readonly optional?: boolean;
};
