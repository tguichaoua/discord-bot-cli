import fs from "fs";

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function editJson(path: string, action: (obj: any) => void): void {
    const o = JSON.parse(fs.readFileSync(path, "utf8"));
    action(o);
    fs.writeFileSync(path, JSON.stringify(o));
}
