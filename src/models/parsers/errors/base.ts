import { UnionParser } from "../buildin/UnionParser";

export class ParseError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "ParseError";
    }
}

export class UnhandledErrorParseError extends ParseError {
    constructor(public readonly error: Error) {
        super(error.message);
        this.name = "UnhandledErrorParseError";
    }
}

export class NotEnoughArgParseError extends ParseError {
    constructor(public readonly expected: number, public readonly got: number) {
        super(`not enough arguments: expected ${expected}, got ${got}.`);
        this.name = "NotEnoughArgParseError";
    }
}

/** Value cannot be parsed */
export class InvalidTypeParseError extends ParseError {
    constructor(public readonly expectedType: string, public readonly valueGot: string) {
        super(`the value cannot be parsed: expected ${expectedType}, got "${valueGot}"`);
        this.name = "InvalidTypeParseError";
    }
}

export class InvalidUnionTypeParseError extends ParseError {
    constructor(public readonly unionParser: UnionParser) {
        super(`cannot parse the following union: ` + unionParser.typeName);
        this.name = "InvalidUnionTypeParseError";
    }
}

/** The parsed value does not meet constraints */
export class InvalidValueParseError extends ParseError {
    constructor(public readonly details?: string) {
        super("the parsed value is invalid" + (details ? ": " + details : "."));
        this.name = "InvalidValueParseError";
    }
}
