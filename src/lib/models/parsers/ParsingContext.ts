import { ArgItem } from "arg-analyser";
import { Message } from "discord.js";
import { clamp } from "../../utils/math";
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

    private next(): ArgItem {
        if (this.current === this.to) throw new NotEnoughArgParseError(1, 0);
        // to is never greater than args length.
        return this.args[this.current++]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    nextString(): string {
        const next = this.next();
        if (next.kind === "string") return next.content;
        throw new InvalidArgumentTypeError("string", next);
    }

    private nextNumber(typename: "float" | "integer"): { arg: string; n: number } {
        const s = this.nextString();
        if (s === "") throw new InvalidTypeParseError(typename, s);
        const n = new Number(s);
        if (Number.isNaN(n)) throw new InvalidTypeParseError(typename, s);
        return { arg: s, n: n.valueOf() };
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
        const s = this.nextString();
        switch (s.toLowerCase()) {
            case "1":
            case "true":
            case "yes":
                return true;
            case "0":
            case "false":
            case "no":
                return false;
            default:
                throw new InvalidTypeParseError("boolean", s);
        }
    }

    rest(): ArgItem[] {
        const rest = this.args.slice(this.current, this.to);
        this.current = this.to;
        return rest;
    }
}
