export namespace ArrayUtils {
    export function isArray(o: any): o is any[] | readonly any[] {
        return Array.isArray(o);
    }
}