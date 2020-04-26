import { Command, CommandQuery } from "../index";

module.exports = new Command("help", {
    description: "Provide help on commands.",
    signatures: [
        {
            executor: executor,
            rest: { name: "command name", description: "The name of the command to get help." }
        }
    ]
});

async function executor({rest, options, commandSet, message, context}: CommandQuery) {
    const cmdPath = rest;

    if (cmdPath.length === 0)
        await message.author.send(`Type \`${options.prefix}list\` to get a list of all commands or \`${options.prefix}help <command name>\` to get help on a command.`);
    else {
        const { command, args } = commandSet.resolve(cmdPath);
        if (!command || args.length != 0)
            await message.author.send(`The command/sub-command "${cmdPath.join(' ')}" cannot be found.`);
        else {
            if (options.help)
                return await options.help({message, options, context, command});
            else {
                const embed = command.getEmbedHelp(options.prefix);
                await message.author.send({ embed });
            }
        }
    }
}