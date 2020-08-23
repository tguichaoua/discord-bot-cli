import { getTimeLeft } from "../utils/timeout";

export class Throttler {
    private _current = 0;
    private _timeout: NodeJS.Timeout | undefined = undefined;

    constructor(
        /** How many time the throttler can be triggered. */
        public readonly count: number,
        /** Time in seconds since the first trigger before the throttler is reset. */
        public readonly duration: number
    ) {}

    /** The number of time this throttler has been triggered. */
    get current() {
        return this._current;
    }

    /** Returns `true` if this throttler has reached the limit, `false` otherwise. */
    get throttled() {
        return this._current >= this.count;
    }

    /** Returns the time in seconds until the throttler is reset. */
    get cooldown() {
        return this._timeout ? Math.ceil(getTimeLeft(this._timeout)) : 0;
    }

    /** Resets this throttler. */
    reset(): void {
        if (this._timeout) clearTimeout(this._timeout);
        this._timeout = undefined;
        this._current = 0;
    }

    /** Increment this throttler.
     * Returns `true` if the limit has not been reached, `false` otherwise.
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
