import { InvalidValueParseError } from "./base";

export class InvalidStringLengthParseError extends InvalidValueParseError {
    constructor(public readonly got: string, public readonly expectedLength: number) {
        super(`the string require at least ${expectedLength} character${expectedLength > 1 ? "s" : ""}.`);
        this.name = "InvalidStringLengthParseError";
    }
}

export class InvalidStringValueParseError extends InvalidValueParseError {
    constructor(public readonly got: string, public readonly expectedValues: readonly string[]) {
        super(`got "${got}", expecting one of following values: ${expectedValues.map(s => `"${s}"`).join(", ")}`);
        this.name = "InvalidStringValueParseError";
    }
}
