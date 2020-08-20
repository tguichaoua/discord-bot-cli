import { makeCommand } from "../../src/index";

const cmd = makeCommand("onlySubs", {
    subs: {
        a: {},
        b: {},
        c: { canUse: () => false },
    },
    useHelpOnSubs: true,
    help: async (c, { message }) => {
        await message.reply(`[HELP] onlySubs ${c.name}`);
    },
});

cmd.subs.a.executor = async (_a, _f, { message }) => {
    await message.reply("A");
};

cmd.subs.b.executor = async (_a, _f, { message }) => {
    await message.reply("B");
};

export default cmd;
