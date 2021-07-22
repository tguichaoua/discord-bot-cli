export type Predicate<T> = (o: T) => boolean;
export type TypeGuard<From, To extends From> = (o: From) => o is To;
export type AtLeastOne<T> = { [K in keyof T]: Required<Pick<T, K>> & Partial<Omit<T, K>> }[keyof T];
export type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never;
