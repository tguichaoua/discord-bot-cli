/** @ignore */
function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export function deepMerge<T, U>(target: T, source: U): T & U;
export function deepMerge<T, U, V>(target: T, source1: U, source2: V): T & U & V;
export function deepMerge<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
export function deepMerge(target: any, ...sources: any[]): any;
/** @ignore */
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