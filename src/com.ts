export function log(...args: any[]) {
    console.log('discord-bot-cli |', ...args);
}

export function error(...args: any[]) {
    console.error('discord-bot-cli |', ...args);
}

export function keyOf<T>(o: T): (keyof T)[] {
    return Object.keys(o) as (keyof T)[];
}