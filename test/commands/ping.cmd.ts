import { makeCommand } from "../../src/index";
import { StringParser } from "../../src/models/parsers";

const cmd = makeCommand("ping", {
    description: "DESCRIPTION",
    args: {
        name: {
            parser: new StringParser().length(5, "name is too short, require at least 5 characters."),
        },
    },
    flags: {
        b: {
            description: "value",
            shortcut: "B",
        },
    },
});

cmd.executor = async ({ name }, { b }, { message }) => {
    await message.reply(":ping_pong: Pong !\n" + `name = ${name}\nb = ${b}`);
};

export default cmd;
