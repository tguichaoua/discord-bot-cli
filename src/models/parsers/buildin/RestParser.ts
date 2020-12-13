import { ArgProvider } from "../ArgProvider";
import { Parser } from "../Parser";

export class RestParser extends Parser<string[]> {
    protected parse(provider: ArgProvider): string[] {
        return provider.rest();
    }
}
