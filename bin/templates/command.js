const { Message } = require("discord.js");
const { Command, CommandSet, Arg, ParseOption, ArgParser } = require("discord-bot-cli");

module.exports = new Command("$NAME$", "DESCRIPTION")
    .signature(executor);

function executor(msg, args, context, options, CommandSet) {

}