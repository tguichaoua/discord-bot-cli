import { Command, CommandQuery } from "../index";
import { HelpUtility } from "../other/HelpUtility";
import { template } from "../utils/template";

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
        await message.author.send(template(options.localization.help.default, {prefix: options.prefix}));
    else {
        const { command, args } = commandSet.resolve(cmdPath);
        if (!command || args.length != 0)
            await message.author.send(template(options.localization.help.commandNotFound, {command: cmdPath.join(" ")}));
        else {
            if (options.help)
                return await options.help({ message, options, context, command });
            else {
                const embed = HelpUtility.Command.embedHelp(command, options.prefix, options.localization);
                await message.author.send({ embed });
            }
        }
    }
}