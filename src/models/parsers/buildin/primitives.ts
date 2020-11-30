import { ArgProvider } from "../ArgProvider";
import { Parser } from "../Parser";

export class StringParser implements Parser<string> {
    constructor() {
        return stringParser ?? this;
    }

    parse(provider: ArgProvider): string {
        return provider.nextString();
    }
}

export class IntegerParser implements Parser<number> {
    constructor() {
        return integerParser ?? this;
    }

    parse(provider: ArgProvider): number {
        return provider.nextInteger();
    }
}

export class FloatParser implements Parser<number> {
    constructor() {
        return floatParser ?? this;
    }

    parse(provider: ArgProvider): number {
        return provider.nextFloat();
    }
}

export class BooleanParser implements Parser<boolean> {
    constructor() {
        return booleanParser ?? this;
    }

    parse(provider: ArgProvider): boolean {
        return provider.nextBoolean();
    }
}

const stringParser = new StringParser();
const integerParser = new IntegerParser();
const floatParser = new FloatParser();
const booleanParser = new BooleanParser();
