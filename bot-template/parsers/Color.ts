import { CustomParser, InvalidValueParseError, ParsingContext } from "../../src/lib";
import { Color } from "../models/Color";

export class ColorParser extends CustomParser<Color> {
    constructor() {
        super("$color$");
    }

    public parse(context: ParsingContext): Color {
        const r = context.nextInteger();
        if (r < 0 || r > 255) throw new InvalidValueParseError();

        const g = context.nextInteger();
        if (g < 0 || g > 255) throw new InvalidValueParseError();

        const b = context.nextInteger();
        if (b < 0 || b > 255) throw new InvalidValueParseError();

        return Color.rgb(r, g, b);
    }
}
