import { getTimeLeft } from "../utils/timeout";

export class Throttler {
    private _current = 0;
    private _timeout: NodeJS.Timeout | undefined = undefined;

    /**
     * @param count How many time the throttler can be triggered.
     * @param duration Time in seconds since the first trigger before the throttler is reset.
     */
    constructor(
        public readonly count: number,
        public readonly duration: number
    ) {}

    /** The number of time this throttler has been triggered. */
    get current() {
        return this._current;
    }

    /** Either or not this throttler has reached the limit. */
    get throttled() {
        return this._current >= this.count;
    }

    /** The time in seconds until the throttler is reset. */
    get cooldown() {
        return this._timeout ? Math.ceil(getTimeLeft(this._timeout)) : 0;
    }

    /** Resets this throttler. */
    reset(): void {
        if (this._timeout) clearTimeout(this._timeout);
        this._timeout = undefined;
        this._current = 0;
    }

    /**
     * Increment the counter.
     * @returns Either or not the limit has been reached.
     */
    add(): boolean {
        const reachedLimit = this.throttled;
        this._current++;
        if (!this._timeout)
            this._timeout = setTimeout(
                () => this.reset(),
                this.duration * 1000
            );
        return reachedLimit;
    }
}
