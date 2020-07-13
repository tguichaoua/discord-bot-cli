import { Logger } from "../src/logger";
import chalk from "chalk";

Logger.log("Hello world");
Logger.warn("Hello world");
Logger.error("Hello world");

Logger.debug(chalk.bold.red("SHOULDN'T APPEAR !"));
Logger.enableDebug = true;
Logger.debug("Hello world");
