import { Message } from "discord.js";
import { Command, CommandSet, Arg, ParseOption, ArgParser } from "discord-bot-cli";

module.exports = new Command("$NAME$", "DESCRIPTION")
    .signature(executor);

function executor(msg: Message, args: ReadonlyMap<string, any>, context: any, options: ParseOption, commandSet: CommandSet) {

}