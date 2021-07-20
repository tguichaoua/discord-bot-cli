import { TupleParser } from "../buildin";
import { ParseError } from "./base";

export class TupleTooMuchArgumentParserError extends ParseError {
    constructor(public readonly tuple: TupleParser) {
        super(); // TODO
        this.name = "TupleTooMuchArgumentParserError";
    }
}

export class TupleNotEnoughArgumentParserError extends ParseError {
    constructor(public readonly tuple: TupleParser) {
        super(); // TODO
        this.name = "TupleNotEnoughArgumentParserError";
    }
}

export class TupleInvalidValueParserError extends ParseError {
    constructor(public readonly tuple: TupleParser, public readonly index: number, public readonly cause: ParseError) {
        super(); // TODO
        this.name = "TupleInvalidValueParserError";
    }
}
