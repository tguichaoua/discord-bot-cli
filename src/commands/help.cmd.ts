import { makeCommand, Parsers } from "../lib";

import { template } from "../lib/utils/template";
import { reply } from "../lib/utils/reply";
import { Localizator } from "../lib/models/localization";

const cmd = makeCommand("help", {
    description: "Provide help about a command.",
    args: {
        commandName: {
            parser: Parsers.rest(Parsers.string),
            name: "command",
            description: "The name of the command.",
        },
    },
    examples: ["help", "help list", "help help", "help command subCommand", "help command subCommand1 subCommand2"],
});

cmd.executor = async ({ commandName }, _, { options, commandSet, message }) => {
    const localizator = Localizator.create(options.localizationResolver, message);
    if (commandName.length === 0)
        await reply(
            message,
            template(localizator.help.default, {
                prefix: options.prefix,
            }),
        );
    else {
        const { command, consumed } = commandSet.resolve(commandName);
        if (!command || consumed < commandName.length)
            await reply(
                message,
                template(localizator.help.commandNotFound, {
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
