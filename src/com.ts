export namespace Com {
    export function log(...args: any[]) {
        console.log('discord-bot-cli |', ...args);
    }

    export function warn(...args: any[]) {
        console.warn('discord-bot-cli |', ...args);
    }

    export function error(...args: any[]) {
        console.error('discord-bot-cli |', ...args);
    }
}