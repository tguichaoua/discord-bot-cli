import { MessageEmbed } from "discord.js";
import { makeCommand, StringParser, UnionParser, IntegerParser } from "../../src";
import { ColorParser } from "../parsers/Color";

const cmd = makeCommand("ping", {
    description: "DESCRIPTION",
    args: {
        name: {
            parser: new StringParser().length(5),
        },
        something: {
            parser: new UnionParser(new IntegerParser(), new StringParser()),
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
