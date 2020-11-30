export class ParseError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class NotEnoughArgParseError extends ParseError {}

/** Value cannot be parsed */
export class InvalidTypeParseError extends ParseError {}

/** Value does not meet constraints*/
export class InvalidValueParseError extends ParseError {}
