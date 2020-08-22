import chalk from "chalk";

/** @internal */
const levels = {
    debug: chalk.green("DEBUG  "),
    log: chalk("LOG    "),
    warn: chalk.yellow("WARNING"),
    error: chalk.red("ERROR  "),
};

/** @internal */
let enableDebug = false;

/** @internal */
function print(level: keyof typeof levels, ...args: any[]) {
    const log =
        level === "error"
            ? console.error
            : level === "warn"
            ? console.warn
            : console.log;
    log(chalk.bold(chalk.blue("[discord-bot-cli]"), levels[level]), ...args);
}

/**
 * Enable or disable logs with `debug` level.
 * @param enable - Default is `true`
 */
export function enableDebugLogs(enable = true) {
    enableDebug = enable;
}

/** @internal */
export const Logger = Object.freeze({
    debug(...args: any[]) {
        if (!enableDebug) return;
        print("debug", ...args);
    },
    log(...args: any[]) {
        print("log", ...args);
    },
    warn(...args: any[]) {
        print("warn", ...args);
    },
    error(...args: any[]) {
        print("error", ...args);
    },
});
