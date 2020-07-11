import { HelpUtils } from "../other/HelpUtils";
import { template } from "../utils/template";
import { makeCommand } from "../other/makeCommand";
import { reply } from "../utils/reply";

const cmd = makeCommand("help", {
    description: "Provide help about a command.",
    rest: {
        type: "string",
        name: "command",
        description: "The name of the command.",
    },
    examples: [
        "help",
        "help list",
        "help help",
        "help command subCommand",
        "help command subCommand1 subCommand2",
    ],
});

cmd.executor = async (_a, _f, { rest, options, commandSet, message }) => {
    if (rest.length === 0)
        await reply(
            message,
            template(options.localization.help.default, {
                prefix: options.prefix,
            })
        );
    else {
        const { command, args } = commandSet.resolve(rest);
        if (!command || args.length != 0)
            await reply(
                message,
                template(options.localization.help.commandNotFound, {
                    command: rest.join(" "),
                })
            );
        else {
            if (command.canUse(message.author, message) !== true) return;
            if (await command.help(message, options)) return;
            const embed = HelpUtils.Command.embedHelp(
                command,
                options.prefix,
                options.localization
            );
            await reply(message, { embed });
        }
    }
};

export default cmd;
