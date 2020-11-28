import { exec } from "../chore";

export function getCurrentBranch(): string {
    const name = exec("git branch --show-current", true).stdout;
    return name.substr(0, name.length - 1);
}

export function hasDiff(): boolean {
    return exec("git diff --raw", true).stdout !== "";
}
