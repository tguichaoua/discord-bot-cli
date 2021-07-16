function* mapIterator<T, U>(iterator: Iterable<T>, fc: (o: T) => U) {
    for (const o of iterator) yield fc(o);
}

function map<K, T, U>(o: ReadonlyMap<K, T>, f: (o: T, key: K) => U): Map<K, U>;
function map<T, U>(o: Record<string, T>, f: (o: T, key: string, index: number) => U): Record<string, U>;
function map<T, U>(o: Record<string, T> | ReadonlyMap<unknown, T>, f: (o: T, key: string, index: number) => U) {
    if (o instanceof Map) {
        return new Map(mapIterator(o.entries(), ([k, v]) => [k, f(v, k, 0)] as const));
    } else {
        return Object.fromEntries(Object.entries(o).map(([key, value], index) => [key, f(value, key, index)] as const));
    }
}
