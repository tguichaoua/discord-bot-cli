const { makeCommand } = require("discord-bot-cli");

const cmd = makeCommand("$NAME$", {
    description: "DESCRIPTION"
});

cmd.executor = async({}, {}, {}) => {

};

exports.default = cmd;
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