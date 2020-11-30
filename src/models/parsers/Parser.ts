import { ArgProvider } from "./ArgProvider";

export interface Parser<T> {
    parse(provider: ArgProvider): T;
}

export type ParserType<P extends Parser<any>> = P extends Parser<infer T> ? T : never;
