import path from "path";

/** @internal */
export function relativeFromEntryPoint(filepath: string) {
    return require.main ? path.relative(require.main.path, filepath) : filepath;
}

/** @internal */
export function resolveFromEntryPoint(filepath: string) {
    return require.main ? path.resolve(require.main.path, filepath) : filepath;
}
