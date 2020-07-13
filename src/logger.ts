import chalk from "chalk";

/** @internal */
const levels = {
    debug: chalk.green("DEBUG  "),
    log: chalk("LOG    "),
    warn: chalk.yellow("WARNING"),
    error: chalk.red("ERROR  "),
};

/** @internal */
export abstract class Logger {
    public static enableDebug = false;

    private static _log(level: keyof typeof levels, ...args: any[]) {
        const log =
            level === "error"
                ? console.error
                : level === "warn"
                ? console.warn
                : console.log;
        log(
            chalk.bold(chalk.blue("[discord-bot-cli]"), levels[level]),
            ...args
        );
    }

    static debug(...args: any[]) {
        if (!this.enableDebug) return;
        this._log("debug", ...args);
    }

    static log(...args: any[]) {
        this._log("log", ...args);
    }

    static warn(...args: any[]) {
        this._log("warn", ...args);
    }

    static error(...args: any[]) {
        this._log("error", ...args);
    }
}
