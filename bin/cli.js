#!/usr/bin/env node

const helpString = `
    Usage
        dbc <command> [options] [--help]

    Commands
        cmd, c      Create a new command file
        loc, l      Create a new localization file
`;

const [, , cmd] = process.argv;


switch (cmd) {
    case "cmd":
    case "c":
        require("./new-command")();
        break;
    case "loc":
    case "l":
        require("./localization")();
        break;
    default:
        console.log(helpString);
        process.exit(2);
}