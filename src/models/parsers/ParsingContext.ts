import { InvalidTypeParseError, NotEnoughArgParseError } from "./errors";

export class ParsingContext {
    private readonly args: readonly string[];
    private readonly from: number;
    private readonly to: number;
    private cur: number;

    public constructor(args: readonly string[], from = 0, to?: number) {
        this.args = args;
        this.from = Math.max(from, 0);
        this.to = Math.min(Math.max(to ?? args.length, from), args.length);
        this.cur = this.from;
    }

    get remaining(): number {
        return this.to - this.cur;
    }

    get consumed(): number {
        return this.cur - this.from;
    }

    clone(): ParsingContext {
        const context = new ParsingContext(this.args, this.from, this.to);
        context.cur = this.cur;
        return context;
    }

    private next(): string {
        if (this.cur === this.to) throw new NotEnoughArgParseError();
        return this.args[this.cur++];
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
                return true;
            default:
                throw new InvalidTypeParseError();
        }
    }

    rest(): string[] {
        const rest = this.args.slice(this.cur, this.to);
        this.cur = this.to;
        return rest;
    }
}
