/** @internal */
function isObject(item: unknown) {
    return item && typeof item === "object" && !Array.isArray(item);
}

/** @internal */
export function deepMerge<T, U>(target: T, source: U): T & U;
/** @internal */
export function deepMerge<T, U, V>(
    target: T,
    source1: U,
    source2: V
): T & U & V;
/** @internal */
export function deepMerge<T, U, V, W>(
    target: T,
    source1: U,
    source2: V,
    source3: W
): T & U & V & W;
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge(target: any, ...sources: any[]): any;
/** @ignore */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge(target: any, ...sources: any[]) {
    if (sources.length === 0) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return deepMerge(target, ...sources);
}
