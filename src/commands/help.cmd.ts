import { Localizator, makeCommand, Parsers } from "../lib";

import { template } from "../lib/utils/template";
import { reply } from "../lib/utils/reply";

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

cmd.executor = async ({ commandName }, _, { options, commandManager, message }) => {
    const localizator = Localizator.create(options.localizationResolver, message);
    if (commandName.length === 0)
        await reply(
            message,
            template(localizator.help.default, {
                prefix: options.prefix,
            }),
        );
    else {
        const { command, consumed } = commandManager.resolve(commandName);
        if (!command || consumed < commandName.length)
            await reply(
                message,
                template(localizator.help.commandNotFound, {
                    command: commandName.join(" "),
                }),
            );
        else {
            if (
                (!options.ownerIDs.includes(message.author.id) || !options.skipOwnerPermissionsChecking) &&
                !command.checkPermissions(message)
            )
                return;

            await command.help(message, options);
        }
    }
};

export default cmd;
