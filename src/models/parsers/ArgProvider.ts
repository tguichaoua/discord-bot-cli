import { InvalidTypeParseError, NotEnoughArgParseError } from "./errors";

export class ArgProvider {
    private readonly args: string[];

    public constructor(args: readonly string[]) {
        this.args = [...args];
    }

    get remaining(): number {
        return this.args.length;
    }

    clone(): ArgProvider {
        return new ArgProvider(this.args);
    }

    private next(): string {
        const str = this.args.shift();
        if (str === undefined) throw new NotEnoughArgParseError();
        return str;
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
}
