import { HelpUtils } from "../other/HelpUtils";
import { template } from "../utils/template";
import { makeCommand } from "../other/makeCommand";
import { reply } from "../utils/reply";

const cmd = makeCommand("help", {
    description: "Provide help on commands.",
    rest: { name: "command name", description: "The name of the command to get help." },
    examples: [
        "help",
        "help list",
        "help help",
        "help command subCommand",
        "help command subCommand1 subCommand2",
    ]
});

cmd.executor = async ({ }, { }, { rest, options, commandSet, message }) => {
    const cmdPath = rest;

    if (cmdPath.length === 0)
        await reply(message, template(options.localization.help.default, { prefix: options.prefix }));
    else {
        const { command, args } = commandSet.resolve(cmdPath);
        if (!command || args.length != 0)
            await reply(message, template(options.localization.help.commandNotFound, { command: cmdPath.join(" ") }));
        else {
            const embed = HelpUtils.Command.embedHelp(command, options.prefix, options.localization);
            await reply(message, { embed });
        }
    }
}

export default cmd;