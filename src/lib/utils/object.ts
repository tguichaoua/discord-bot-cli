function mapEntries<T, U>(o: Record<string, T>, fc: (o: T, key: string, index: number) => U): Record<string, U> {
    return Object.fromEntries(Object.entries(o).map(([key, value], index) => [key, fc(value, key, index)] as const));
}
