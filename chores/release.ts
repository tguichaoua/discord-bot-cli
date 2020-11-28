import { need, exec, error } from "./chore";
import { getCurrentBranch, hasDiff } from "./utils/git";
import { inc, major, ReleaseType } from "semver";
import { version } from "../package.json";
import { editJson } from "./utils/util";
import { info } from "console";

need("git", "npm");

const [, , semver] = process.argv;

if (!["major", "minor", "patch"].includes(semver)) error("Usage: npm run release <major | minor | patch>");

const nextVersion = inc(version, semver as ReleaseType);
if (nextVersion === null) error("Invalid next version :", nextVersion);

const releaseBranchName = `release/${nextVersion}`;

if (getCurrentBranch() !== "master") error("The current branch must be 'master'");
if (hasDiff()) error("There are not commited changes on the current branch");

exec("pull master", "git pull");
exec("create release branch", `git branch "${releaseBranchName}"`);
exec("checkout release branch", `git checkout "${releaseBranchName}"`);

exec("bump version", `npm --no-git-tag-version version ${nextVersion} && git commit -am "🔖 ${version}"`);

if (semver === "major") {
    info("update doctype settings");
    editJson("doctype.json", o => (o.out = `./docs/v${major(nextVersion)}/`));
}

exec("generate docs", 'npm run docs && git commit -am "📝 generate docs"');

exec("push", `git push --set-upstream origin ${releaseBranchName}`);
