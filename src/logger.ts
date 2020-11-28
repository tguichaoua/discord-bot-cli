import chalk from "chalk";
import { EventEmitter } from "events";

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    OFF = 999,
}

export type LogName = "debug" | "info" | "warn" | "error";

/** @internal */
type Level = Exclude<LogLevel, LogLevel.OFF>;

/** @internal */
const levelTitles: Record<Level, string> = {
    [LogLevel.DEBUG]: chalk.green("DEBUG  "),
    [LogLevel.INFO]: chalk("INFO   "),
    [LogLevel.WARN]: chalk.yellow("WARNING"),
    [LogLevel.ERROR]: chalk.red("ERROR  "),
};

/** @internal */
let minLevel = LogLevel.INFO;
/** @internal */
let auto = false;
/** @internal */
const eventEmitter = new EventEmitter();

/** @internal */
function eventName(level: Level): LogName {
    switch (level) {
        case LogLevel.DEBUG:
            return "debug";
        case LogLevel.INFO:
            return "info";
        case LogLevel.WARN:
            return "warn";
        case LogLevel.ERROR:
            return "error";
    }
}

/** @internal */
function print(level: Level, ...args: any[]): void {
    if (level < minLevel) return;
    if (auto) {
        const log = level === LogLevel.ERROR ? console.error : level === LogLevel.WARN ? console.warn : console.log;
        log(chalk.bold(chalk.blue("[discord-bot-cli]"), levelTitles[level]), ...args);
    } else {
        eventEmitter.emit(eventName(level), args.join(" "));
    }
}

/** @internal */
export const Logger = Object.freeze({
    debug(...args: any[]): void {
        print(LogLevel.DEBUG, ...args);
    },
    log(...args: any[]): void {
        print(LogLevel.INFO, ...args);
    },
    warn(...args: any[]): void {
        print(LogLevel.WARN, ...args);
    },
    error(...args: any[]): void {
        print(LogLevel.ERROR, ...args);
    },
});

type LogListener = (str: string) => void;

export const Logs = Object.freeze({
    on(event: LogName, listener: LogListener) {
        eventEmitter.on(event, listener);
        return this;
    },
    once(event: LogName, listener: LogListener) {
        eventEmitter.once(event, listener);
        return this;
    },
    off(event: LogName, listener: LogListener) {
        eventEmitter.off(event, listener);
        return this;
    },
    auto(value: boolean) {
        auto = value;
        return this;
    },
    minLevel(level: LogLevel) {
        minLevel = level;
        return this;
    },
});
