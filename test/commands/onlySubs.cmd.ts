import { makeCommand } from "../../src/index";

const cmd = makeCommand("onlySubs", {
    subs: {
        a: {},
        b: {},
    },
});

cmd.subs.a.executor = async (_a, _f, { message }) => {
    await message.reply("A");
};

cmd.subs.b.executor = async (_a, _f, { message }) => {
    await message.reply("B");
};

export default cmd;
