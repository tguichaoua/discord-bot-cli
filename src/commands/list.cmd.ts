import { MessageEmbed } from "discord.js";
import { makeCommand, ListUtils } from "../lib";
import { Localizator } from "../lib/models/localization";

import { reply } from "../lib/utils/reply";

const cmd = makeCommand("list", {
    description: "Display a list of all avaible commands.",
    flags: {
        detail: {
            description: "Provide commands description.",
        },
    },
    examples: ["list", "list -d"],
});

cmd.executor = async (_, { detail }, { commandSet, options, message }) => {
    const localizator = Localizator.create(options.localizationResolver, message);
    const raw = ListUtils.getListRawData(commandSet, localizator);
    let commands = options.devIDs.includes(message.author.id)
        ? raw.commands
        : raw.commands.filter(c => !c.command.devOnly);

    if (!options.devIDs.includes(message.author.id) || !options.skipDevsPermissionsChecking)
        commands = commands.filter(c => c.command.checkPermissions(message));

    const embed = new MessageEmbed().setColor("#0099ff").setTitle(localizator.list.title);

    const descriptions = detail
        ? commands.map(c => `\`${c.command.name}\` ${c.description}`).join("\n")
        : commands.map(c => `\`${c.command.name}\``).join(" ");

    embed.setDescription(descriptions);

    await reply(message, { embed });
};

export default cmd;
