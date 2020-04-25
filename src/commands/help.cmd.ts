import { Command, CommandQuery } from "../index";

module.exports = new Command("help", {
    description: "Provide help on commands.",
    signatures: [
        {
            executor: executor,
            rest: {name:"command name", description: "The name of the command to get help."}
        }
    ]
});

async function executor(query: CommandQuery) {
    const cmdPath = query.rest;

    if (cmdPath.length === 0)
        await query.message.author.send(`Type \`${query.options.prefix}list\` to get a list of all commands or \`${query.options.prefix}help <command name>\` to get help on a command.`);
    else {
        const { command, args } = query.commandSet.resolve(cmdPath);
        if (!command || args.length != 0)
            await query.message.author.send(`The command/sub-command "${cmdPath.join(' ')}" cannot be found.`);
        else {
            const embed = command.getEmbedHelp(query.options.prefix);
            await query.message.author.send({ embed });
        }
    }
}