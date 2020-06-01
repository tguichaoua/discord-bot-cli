import { HelpUtility } from "../other/HelpUtility";
import { template } from "../utils/template";
import { makeCommand } from "../other/makeCommand";

const cmd = makeCommand("help", {
    description: "Provide help on commands.",
    rest: { name: "command name", description: "The name of the command to get help." }
});

cmd.executor = async ({ }, { }, { rest, options, commandSet, message }) => {
    const cmdPath = rest;

    if (cmdPath.length === 0)
        await message.author.send(template(options.localization.help.default, { prefix: options.prefix }));
    else {
        const { command, args } = commandSet.resolve(cmdPath);
        if (!command || args.length != 0)
            await message.author.send(template(options.localization.help.commandNotFound, { command: cmdPath.join(" ") }));
        else {
            if (options.help)
                throw new Error("Not implemented");
            //return await options.help({});
            else {
                const embed = HelpUtility.Command.embedHelp(command, options.prefix, options.localization);
                await message.author.send({ embed });
            }
        }
    }
}

export default cmd;