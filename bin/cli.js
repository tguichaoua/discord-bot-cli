#!/usr/bin/env node

const helpString = `
    Usage
        dbc <command> [options] [--help]

    Commands
        cmd, c      Create a new command files
`;

const [, , cmd] = process.argv;


switch (cmd) {
    case "cmd":
    case "c":
        require("./new-command")();
        break;

    default:
        console.log(helpString);
        process.exit(2);
}