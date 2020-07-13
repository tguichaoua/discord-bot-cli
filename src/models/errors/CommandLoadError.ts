export class CommandLoadError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "CommandLoadError";
    }
}
