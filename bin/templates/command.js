const { makeCommand } = require("discord-bot-cli");

const cmd = makeCommand("NAME", {
    description: "DESCRIPTION"
});

cmd.executor = async({}, {}, {}) => {

};

export default cmd;