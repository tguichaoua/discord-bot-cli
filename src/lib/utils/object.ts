function mapEntries<T, U>(o: Record<string, T>, fc: (o: T, key: string, index: number) => U): Record<string, U> {
    return Object.fromEntries(Object.entries(o).map(([key, value], index) => [key, fc(value, key, index)] as const));
}

function mapMapEntries<K, T, U>(m: ReadonlyMap<K, T>, fc: (o: T, key: K) => U): Map<K, U> {
    return new Map(mapIterator(m.entries(), ([k, v]) => [k, fc(v, k)] as const));
}

function* mapIterator<T, U>(i: Iterable<T>, fc: (o: T) => U) {
    for (const o of i) yield fc(o);
}
