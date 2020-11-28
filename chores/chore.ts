import shell from "shelljs";
import chalk from "chalk";
import { argv } from "process";

let quiet: number;

function getQuiet(): number {
    if (quiet === undefined) {
        quiet = 0;
        for (const a of argv) {
            if (a === "-q") {
                quiet = 1;
                break;
            }
            if (a === "-qq") {
                quiet = 2;
                break;
            }
            if (a === "-qqq" || a === "-Q") {
                quiet = 3;
                break;
            }
        }
    }
    return quiet;
}

export function need(...command: string[]): void {
    const missings: string[] = command.filter(cmd => !shell.which(cmd));

    if (missings.length !== 0) {
        shell.echo(`Sorry, this script requires ${missings.join(", ")}`);
        shell.exit(1);
    }
}

export function exec(command: string, silent?: boolean): shell.ShellString;
export function exec(info: string, command: string, silent?: boolean): shell.ShellString;
export function exec(i: string, cmd_silent: string | boolean = false, silent = false): shell.ShellString {
    let cmd: string;
    if (typeof cmd_silent === "string") {
        cmd = cmd_silent;
        info(i);
    } else {
        cmd = i;
        silent = cmd_silent;
    }

    return shell.exec(cmd, { fatal: true, silent });
}

export function error(...text: unknown[]): never {
    console.log(chalk.red(text));
    shell.exit(1);
}

export function title(title: string): void {
    if (getQuiet() > 2) return;
    shell.echo(chalk.white.bold(`[${title}]`));
}

export function info(...text: unknown[]): void {
    if (getQuiet() > 1) return;
    shell.echo(chalk.blue(text));
}

export function details(...text: unknown[]): void {
    if (getQuiet() > 0) return;
    shell.echo(chalk.italic.cyan(text));
}
