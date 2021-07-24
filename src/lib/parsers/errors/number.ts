import { InvalidValueParseError } from "./base";

export class InvalidRangeParseError extends InvalidValueParseError {
    constructor(public readonly got: number, public readonly min: number, public readonly max: number) {
        super(`expecting value between ${min} and ${max}, got ${got}`);
        this.name = "InvalidRangeParseError";
    }
}

export class InvalidMinValueParseError extends InvalidValueParseError {
    constructor(public readonly got: number, public readonly min: number) {
        super(`expecting value greater than or equals to ${min}, got ${got}`);
        this.name = "InvalidMinValueParseError";
    }
}

export class InvalidMaxValueParseError extends InvalidValueParseError {
    constructor(public readonly got: number, public readonly max: number) {
        super(`expecting value lower than or equals to ${max}, got ${got}`);
        this.name = "InvalidMaxValueParseError";
    }
}
