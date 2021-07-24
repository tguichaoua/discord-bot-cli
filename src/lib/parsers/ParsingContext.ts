import { ArgItem } from "arg-analyser";
import { Message } from "discord.js";
import { clamp } from "../utils/math";
import { InvalidArgumentTypeError, InvalidTypeParseError, NotEnoughArgParseError } from "./errors";

export class ParsingContext {
    public readonly message: Message;
    private readonly args: readonly ArgItem[];
    private readonly from: number;
    private readonly to: number;
    private current: number;
    private states: number[] = [];

    public constructor(message: Message, args: readonly ArgItem[], from = 0, to?: number) {
        this.message = message;
        this.args = args;
        this.from = Math.max(from, 0);
        this.to = to ? clamp(to, from, args.length) : args.length;
        this.current = this.from;
    }

    get remaining(): number {
        return this.to - this.current;
    }

    get consumed(): number {
        return this.current - this.from;
    }

    saveState(): void {
        this.states.push(this.current);
    }

    restoreState(): void {
        if (this.states.length) this.current = this.states[this.states.length - 1]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    removeState(): void {
        this.states.pop();
    }

    clone(): ParsingContext {
        const context = new ParsingContext(this.message, this.args, this.from, this.to);
        context.current = this.current;
        return context;
    }

    /**
     * Checks if the remaining number of arguments is greater or equals than the expected number of arguments.
     * If it's not the case, throws an `NotEnoughArgParseError` error.
     * @param minimumArgExpected The minimum number of arguments expected
     */
    public require(minimumArgExpected: number): void {
        if (this.remaining < minimumArgExpected) throw new NotEnoughArgParseError(minimumArgExpected, this.remaining);
    }

    /**
     * Consumes the next argument and returns it.
     * @returns The next argument
     * @throws {NotEnoughArgParseError} If the remaining number of argument is 0
     *
     */
    next(): ArgItem {
        if (this.current === this.to) throw new NotEnoughArgParseError(1, 0);
        // to is never greater than args length.
        return this.args[this.current++]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    /**
     * Returns the next arguments without consumes it.
     * @returns The next argument
     * @throws {NotEnoughArgParseError} If the remaining number of argument is 0
     */
    peek(): ArgItem {
        if (this.current === this.to) throw new NotEnoughArgParseError(1, 0);
        // to is never greater than args length.
        return this.args[this.current]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    nextString(): string {
        const next = this.next();
        if (next.kind === "string") return next.content;
        throw new InvalidArgumentTypeError("string", next);
    }

    private nextNumber(typename: "float" | "integer"): { arg: string; n: number } {
        const next = this.next();
        if (next.kind !== "string") throw new InvalidArgumentTypeError(typename, next);
        if (next.content === "") throw new InvalidTypeParseError(typename, next.content);
        const n = new Number(next.content);
        if (Number.isNaN(n)) throw new InvalidTypeParseError(typename, next.content);
        return { arg: next.content, n: n.valueOf() };
    }

    nextFloat(): number {
        return this.nextNumber("float").n;
    }

    nextInteger(): number {
        const { arg, n } = this.nextNumber("integer");
        if (!Number.isInteger(n)) throw new InvalidTypeParseError("integer", arg);
        return n;
    }

    nextBoolean(): boolean {
        const next = this.next();
        if (next.kind !== "string") throw new InvalidArgumentTypeError("boolean", next);
        switch (next.content.toLowerCase()) {
            case "1":
            case "true":
            case "yes":
                return true;
            case "0":
            case "false":
            case "no":
                return false;
            default:
                throw new InvalidTypeParseError("boolean", next.content);
        }
    }

    rest(): ArgItem[] {
        const rest = this.args.slice(this.current, this.to);
        this.current = this.to;
        return rest;
    }
}
