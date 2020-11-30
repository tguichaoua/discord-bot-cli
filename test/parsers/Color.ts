import { ArgProvider } from "../../src/models/parsers/ArgProvider";
import { InvalidValueParseError } from "../../src/models/parsers/errors";
import { Parser } from "../../src/models/parsers/Parser";

export class ColorParser extends Parser<Color> {
    protected parse(provider: ArgProvider): Color {
        const r = provider.nextInteger();
        if (r < 0 || r > 255) throw new InvalidValueParseError();

        const g = provider.nextInteger();
        if (g < 0 || g > 255) throw new InvalidValueParseError();

        const b = provider.nextInteger();
        if (b < 0 || b > 255) throw new InvalidValueParseError();

        return { r, g, b };
    }
}

interface Color {
    r: number;
    g: number;
    b: number;
}
