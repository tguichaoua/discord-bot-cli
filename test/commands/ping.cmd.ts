import { makeCommand } from "../../src/index";
import { IntegerParser, StringParser, UnionParser } from "../../src/models/parsers";

const cmd = makeCommand("ping", {
    description: "DESCRIPTION",
    args: {
        name: {
            parser: new StringParser().length(5, "name is too short, require at least 5 characters."),
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
