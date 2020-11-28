import { info, title, details } from "./chore";
import { join } from "path";
import { readdirSync, unlinkSync } from "fs";
import { cp } from "shelljs";

title("Post Build");

const uselessDTsFolders = ["bin", "commands"];

info("Remove useless `.d.ts` files");
for (const f of uselessDTsFolders) {
    const path = join("./dist/", f);
    details(`\t- ${f}`);
    for (const file of readdirSync(path)) {
        if (file.endsWith(".d.ts")) unlinkSync(join(path, file));
    }
}

info("Copy assets");
cp("-r", "./src/assets", "./dist");
