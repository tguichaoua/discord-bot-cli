import path from "path";

export default {
    relativeFromEntryPoint(filepath: string) {
        return require.main
            ? path.relative(require.main.path, filepath)
            : filepath;
    },
    resolveFromEntryPoint(filepath: string) {
        return require.main
            ? path.resolve(require.main.path, filepath)
            : filepath;
    },
};
