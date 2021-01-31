import { Message } from "discord.js";
import { clamp } from "../../utils/math";
import { InvalidTypeParseError, NotEnoughArgParseError } from "./errors";

export class ParsingContext {
    public readonly message: Message;
    private readonly args: readonly string[];
    private readonly from: number;
    private readonly to: number;
    private current: number;

    public constructor(message: Message, args: readonly string[], from = 0, to?: number) {
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

    clone(): ParsingContext {
        const context = new ParsingContext(this.message, this.args, this.from, this.to);
        context.current = this.current;
        return context;
    }

    private next(): string {
        if (this.current === this.to) throw new NotEnoughArgParseError();
        return this.args[this.current++];
    }

    nextString(): string {
        return this.next();
    }

    nextFloat(): number {
        const s = this.next();
        if (s === "") throw new InvalidTypeParseError();
        const n = new Number(s);
        if (Number.isNaN(n)) throw new InvalidTypeParseError();
        return n.valueOf();
    }

    nextInteger(): number {
        const n = this.nextFloat();
        if (!Number.isInteger(n)) throw new InvalidTypeParseError();
        return n;
    }

    nextBoolean(): boolean {
        switch (this.next().toLowerCase()) {
            case "1":
            case "true":
            case "yes":
                return true;
            case "0":
            case "false":
            case "no":
                return false;
            default:
                throw new InvalidTypeParseError();
        }
    }

    rest(): string[] {
        const rest = this.args.slice(this.current, this.to);
        this.current = this.to;
        return rest;
    }
}
