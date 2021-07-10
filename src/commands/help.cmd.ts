import { template } from "../utils/template";
import { makeCommand } from "../other/makeCommand";
import { reply } from "../utils/reply";
import { Parsers } from "../models/parsers";

const cmd = makeCommand("help", {
    description: "Provide help about a command.",
    args: {
        commandName: {
            parser: Parsers.rest,
            name: "command",
            description: "The name of the command.",
        },
    },
    examples: ["help", "help list", "help help", "help command subCommand", "help command subCommand1 subCommand2"],
});

cmd.executor = async ({ commandName }, _, { options, commandSet, message }) => {
    if (commandName.length === 0)
        await reply(
            message,
            template(options.localization.help.default, {
                prefix: options.prefix,
            }),
        );
    else {
        const { command, args } = commandSet.resolve(commandName);
        if (!command || args.length != 0)
            await reply(
                message,
                template(options.localization.help.commandNotFound, {
                    command: commandName.join(" "),
                }),
            );
        else {
            if (
                (!options.devIDs.includes(message.author.id) || !options.skipDevsPermissionsChecking) &&
                !command.checkPermissions(message)
            )
                return;

            await command.help(message, options);
        }
    }
};

export default cmd;
