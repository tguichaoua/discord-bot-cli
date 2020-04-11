const { Message } = require("discord.js");
const { Command, CommandSet, Arg, ArgParser } = require("discord-bot-cli");

module.exports = new Command("$NAME$", "DESCRIPTION")
    .signature(executor);

/**@param {Message} msg @param {ReadonlyMap<string, any>} args @param {*} context 
 * @param {import("discord-bot-cli").ParseOption} options @param {CommandSet} commandSet */
function executor(msg, args, context, options, commandSet) {

}