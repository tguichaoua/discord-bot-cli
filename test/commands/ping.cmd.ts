import { makeCommand } from "../../src/index";

const cmd = makeCommand("ping", {
    description: "DESCRIPTION",
    args: {
        a: { type: "float" }
    }
});

cmd.executor = async(_a, _f, { message }) => {
    await message.reply(":ping_pong: Pong !");
};

export default cmd;