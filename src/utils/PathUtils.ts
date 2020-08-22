import path from "path";

export function relativeFromEntryPoint(filepath: string) {
    return require.main ? path.relative(require.main.path, filepath) : filepath;
}

export function resolveFromEntryPoint(filepath: string) {
    return require.main ? path.resolve(require.main.path, filepath) : filepath;
}
