import { Command, ArgMap } from "../Command";
import { Message } from "discord.js";
import { ParseOption, CommandSet } from "../CommandSet";
import { RestParser } from "../argParsers/Rest";
import { Arg } from "../Arg";


module.exports = new Command("help", "Provide help on commands.")
    .signature(executor,
        new Arg("command name", "The name of the command to get help.", true, new RestParser())
    );

async function executor(msg: Message, args: ArgMap, context: any, options: ParseOption, CommandSet: CommandSet) {
    const cmdPath = args.get('command name');

    if (cmdPath.length === 0)
        await msg.author.send(`Type \`${options.prefix}list\` to get a list of all commands or \`${options.prefix}help <command name>\` to get help on a command.`);
    else {
        const { command, args } = CommandSet.resolve(cmdPath);
        if (!command || args.length != 0)
            await msg.author.send(`The command/sub-command "${cmdPath.join(' ')}" cannot be found.`);
        else {
            const embed = command.getEmbedHelp(options.prefix);
            await msg.author.send({ embed });
        }
    }
}