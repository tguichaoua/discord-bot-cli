#!/usr/bin/env node

const helpString = `
    Usage
        dbc <command> [options] [--help]
    Commands
        cmd, c      Create a new command file
        loc, l      Create a new localization file
`;

import newCommand from "./new-command";
import localization from "./localization";

const [, , cmd] = process.argv;

switch (cmd) {
    case "cmd":
    case "c":
        newCommand();
        break;
    case "loc":
    case "l":
        localization();
        break;
    default:
        console.log(helpString);
        process.exit(2);
}
