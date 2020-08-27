/** @internal */
export function isArray(o: unknown): o is unknown[] | readonly unknown[] {
    return Array.isArray(o);
}

/** @internal */
export function distinct<T>(a: T[]): T[] {
    return [...new Set(a)];
}
