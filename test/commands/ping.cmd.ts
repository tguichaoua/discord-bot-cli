import { MessageEmbed } from "discord.js";
import { makeCommand, Parsers } from "../../src";
import { ColorParser } from "../parsers/Color";

const cmd = makeCommand("ping", {
    description: "DESCRIPTION",
    args: {
        name: {
            parser: Parsers.string.if(s => s.length < 5),
        },
        something: {
            parser: Parsers.union(Parsers.integer, Parsers.string),
        },
        color: {
            parser: new ColorParser(),
        },
    },
    flags: {
        b: {
            description: "value",
            shortcut: "B",
        },
    },
});

cmd.executor = async ({ name, something, color }, { b }, { message }) => {
    const m = new MessageEmbed()
        .setColor(color)
        .setTitle(":ping_pong: Pong !")
        .setDescription(`name = ${name}\nsomething = (${typeof something}) ${something}\ncolor=${color}\nb = ${b}`);
    await message.reply(m);
};

export default cmd;
