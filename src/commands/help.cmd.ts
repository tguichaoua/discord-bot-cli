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

async function executor({ rest, options, commandSet, message, context }: CommandQuery) {
    const cmdPath = rest;

    if (cmdPath.length === 0)
        await message.author.send(options.localization.help.default.replace(/\$prefix\$/gi, options.prefix));
    else {
        const { command, args } = commandSet.resolve(cmdPath);
        if (!command || args.length != 0)
            await message.author.send(options.localization.help.commandNotFound.replace(/\$command\$/gi, cmdPath.join(' ')));
        else {
            if (options.help)
                return await options.help({ message, options, context, command });
            else {
                const embed = command.getEmbedHelp(options);
                await message.author.send({ embed });
            }
        }
    }
}