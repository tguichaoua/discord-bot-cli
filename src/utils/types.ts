export type Predicate<T> = (o: T) => boolean;
export type TypeGuard<From, To extends From> = (o: From) => o is To;
