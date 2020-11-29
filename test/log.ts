import { Logger, LogLevel, Logs } from "../src/logger";
import chalk from "chalk";

Logs.auto(true);

Logger.info("Hello world");
Logger.warn("Hello world");
Logger.error("Hello world");

Logger.debug(chalk.bold.red("SHOULDN'T APPEAR !"));
Logs.minLevel(LogLevel.DEBUG);
Logger.debug("Hello world");

function test(level: string, s: string) {
    console.log(`${level} - ${s}`);
}

Logs.auto(false)
    .on("debug", s => test("debug", s))
    .on("info", s => test("info", s))
    .on("warn", s => test("warn", s))
    .on("error", s => test("error", s));

Logger.info("Hello world");
Logger.warn("Hello world");
Logger.error("Hello world");
Logger.debug("Hello world");
