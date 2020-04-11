const path = require("path");
const fs = require("fs")
const meow = require("meow");


const helpString = `
Create a new command file.

Usage
    dbc cmd path/to/file_without_extension [options]

Options
    --lang, -l <js|ts>  Define the language. Javascript (js) or Typescript (ts). (Default = js)
    --force, -f         If the destination file already exists it will be overwritten
`;


module.exports = function f() {

    const cli = meow(helpString, {
        flags: {
            lang: {
                type: "string",
                alias: "l",
                default: "js"
            },
            force: {
                type: "boolean",
                alias: "f",
                default: false
            }
        }
    });

    if (cli.input.length < 2) cli.showHelp();

    if (!(cli.flags.lang in ["js", "ts"])) {
        console.log("--lang must be either js or ts");
        cli.showHelp();
    }

    const ext = cli.flags.lang;
    const parsedPath = path.parse(cli.input[1]);

    const filePath = path.format({
        dir: parsedPath.dir,
        name: parsedPath.name,
        ext: ".cmd." + ext
    })

    const template = fs.readFileSync("./templates/command." + ext)
        .toString().replace("$NAME$", parsedPath.name);
    fs.writeFileSync(filePath, template);
}