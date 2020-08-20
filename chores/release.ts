// git checkout master
// git pull
// npm --no-git-tag-version version [major, minor, patch]
// git commit -A "bump version to X.X.X"
// git push
// git checkout stable
// git pull
// git merge master
// git push

import shell from "shelljs";
import chore from "./chore";

chore.require("git", "npm");

const [, , semver] = process.argv;

if (!["major", "minor", "patch"].includes(semver)) {
    shell.echo("Usage: npm run release <major | minor | patch>");
    shell.exit(1);
}

chore.exec("pull master", "git checkout master && git pull");
chore.exec("bump version", `npm --no-git-tag-version version ${semver}`);

import { version } from "../package.json";

chore.exec(
    "commit & push",
    `git commit -A "bump version to ${version}" && git push`
);
chore.exec(
    "merge master on stable & pull",
    "git checkout stable && git pull && git merge master && git push"
);
