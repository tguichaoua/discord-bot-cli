const { Command } = require("discord-bot-cli");

module.exports = new Command("$NAME$", {
    description: "...",
    signatures: [{
        executor: executor,
    }]
});

/**@param {import("discord-bot-cli").CommandQuery;} query */
function executor(query) {

}