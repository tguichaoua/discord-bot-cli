// git checkout master
// git pull
// npm --no-git-tag-version version [major, minor, patch]
// git commit -A "bump version to X.X.X"
// git push
// git checkout stable
// git pull
// git merge master
// git push

import { need, exec, error } from "./chore";
import { getCurrentBranch } from "./utils/git";

need("git", "npm");

const [, , semver] = process.argv;

if (!["major", "minor", "patch"].includes(semver)) {
    error("Usage: npm run release <major | minor | patch>");
}

if (getCurrentBranch() !== "master") {
    error("The current branch must be 'master'");
}

exec("pull master", "git pull");
exec("bump version", `npm --no-git-tag-version version ${semver}`);

import { version } from "../package.json";

exec("commit & push", `git commit -A "bump version to ${version}" && git push`);
exec("merge master on stable & pull", "git checkout stable && git pull && git merge master && git push");
