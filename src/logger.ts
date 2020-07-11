export abstract class Logger {
    static log(...args: any[]) {
        console.log("discord-bot-cli |", ...args);
    }

    static warn(...args: any[]) {
        console.warn("discord-bot-cli |", ...args);
    }

    static error(...args: any[]) {
        console.error("discord-bot-cli |", ...args);
    }
}
