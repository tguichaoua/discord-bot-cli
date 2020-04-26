import { ParsableTypeName } from "./ParsableType";

export interface Localization {
    typeNames: { [type in ParsableTypeName]: string }
}