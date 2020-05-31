import { MessageEmbed } from "discord.js";
import { template } from "../utils/template";
import { makeCommand } from "../other/makeCommand";

const cmd = makeCommand("list", {
    description: "Display a list of all avaible commands.",
    args: {
        page: {
            type: "integer",
            optional: true,
            defaultValue: 1,
            description: "The page of the list to display.",
            validator: p => p >= 1
        }
    }
});

cmd.executor = async ({ page }, { }, { commandSet, options, message }) => {

    let allCommands = Array.from(commandSet.commands());

    // if the author is not a dev. Hide devOnly commands.
    if (!options.devIDs.includes(message.author.id))
        allCommands = allCommands.filter(c => !c.devOnly);

    const pageCount = Math.ceil(allCommands.length / options.listCommandPerPage);

    if (page > pageCount) {
        await message.author.send(template(options.localization.list.invalidPage, { page_count: pageCount.toString() }));
        return;
    }

    // sort commands by name
    allCommands.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });

    let commands = allCommands.slice(options.listCommandPerPage * (page - 1), options.listCommandPerPage);

    if (options.list)
        throw new Error("Not implemented");
    //return await options.list({ message, options, context, allCommands, commands, page, pageCount });

    const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle(`Page ${page}/${pageCount}`);

    for (const cmd of commands)
        embed.addField(cmd.name, options.localization.commands[cmd.name]?.description ?? cmd.description);

    message.author.send({ embed });
}

export default cmd;