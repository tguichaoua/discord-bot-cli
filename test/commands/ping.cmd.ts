import { makeCommand } from "../../src/index";
import { IntegerParser, StringParser } from "../../src/models/parsers";

const cmd = makeCommand("ping", {
    description: "DESCRIPTION",
    args: {
        a: {
            parser: new StringParser().if(s => s.length >= 5),
            description: "hi !",
            optional: true,
            defaultValue: "Hello",
        },
    },
    flags: {
        b: {
            parser: new IntegerParser().range(0, 255),
            defaultValue: "",
            description: "value",
            shortcut: "B",
        },
    },
});

cmd.executor = async ({ a }, { b }, { message }) => {
    await message.reply(":ping_pong: Pong !");
};

export default cmd;
