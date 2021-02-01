import { makeCommand, StringParser, UnionParser, IntegerParser } from "../../src";

const cmd = makeCommand("ping", {
    description: "DESCRIPTION",
    args: {
        name: {
            parser: new StringParser().length(5),
        },
        something: {
            parser: new UnionParser(new IntegerParser(), new StringParser()),
        },
    },
    flags: {
        b: {
            description: "value",
            shortcut: "B",
        },
    },
});

cmd.executor = async ({ name, something }, { b }, { message }) => {
    await message.reply(
        ":ping_pong: Pong !\n" + `name = ${name}\nsomething = (${typeof something}) ${something}\nb = ${b}`,
    );
};

export default cmd;
