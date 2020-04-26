import { Command, CommandQuery } from "../index";
import { MessageEmbed } from "discord.js";

const COMMAND_PER_PAGE = 7;

module.exports = new Command("list", {
    description: "Display a list of all avaible commands.",
    signatures: [{
        executor: executor,
        args: {
            page: {
                type: "integer",
                optional: true,
                defaultValue: 1,
                description: "The page of the list to display.",
                validator: p => p >= 1
            }
        }
    }]
});

async function executor(query: CommandQuery) {
    const page = query.args.get("page") as number;

    let cmds = Array.from(query.commandSet.commands());

    // if the author is not a dev. Hide devOnly commands.
    if (!query.options.devIDs.includes(query.message.author.id))
        cmds = cmds.filter(c => !c.isDevOnly);

    const maxPage = Math.ceil(cmds.length / COMMAND_PER_PAGE);

    if (page > maxPage) {
        await query.message.author.send(`The number of the page must be between 1 and ${maxPage}.`);
        return;
    }

    // sort commands by name
    cmds.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });

    const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle(`Page ${page}/${maxPage}`);

    const startIdx = COMMAND_PER_PAGE * (page - 1);
    for (let i = 0; i < COMMAND_PER_PAGE; i++) {
        const j = startIdx + i;
        if (j >= cmds.length) break;
        const cmd = cmds[j];

        if (cmd.description) var description = cmd.description;
        else description = "---";

        embed.addField(cmd.name, description);
    }

    query.message.author.send({ embed });
}