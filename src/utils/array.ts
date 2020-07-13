export abstract class ArrayUtils {
    static isArray(o: any): o is any[] | readonly any[] {
        return Array.isArray(o);
    }

    static distinct<T>(a: T[]): T[] {
        return [...new Set(a)];
    }
}
