import { MessageEmbed } from "discord.js";
import { makeCommand } from "../other/makeCommand";
import { ListUtils } from "../other/ListUtils";
import { reply } from "../utils/reply";

const cmd = makeCommand("list", {
    description: "Display a list of all avaible commands.",
    flags: {
        detail: {
            type: "boolean",
            shortcut: "d",
            description: "Provide commands description.",
        },
    },
    examples: ["list", "list -d"],
});

cmd.executor = async (_a, { detail }, { commandSet, options, message }) => {
    const raw = ListUtils.getRawListData(commandSet, options.localization);
    let commands = options.devIDs.includes(message.author.id)
        ? raw.commands
        : raw.commands.filter((c) => !c.command.devOnly);

    if (
        !options.devIDs.includes(message.author.id) ||
        !options.skipDevsPermissionsChecking
    )
        commands = commands.filter(
            (c) => c.command.canUse(message.author, message) === true
        );

    const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle(options.localization.list.title);

    const descriptions = detail
        ? commands
              .map((c) => `\`${c.command.name}\` ${c.description}`)
              .join("\n")
        : commands.map((c) => `\`${c.command.name}\``).join(" ");

    embed.setDescription(descriptions);

    await reply(message, { embed });
};

export default cmd;
