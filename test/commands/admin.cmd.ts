import { makeCommand } from "../../src/index";

const cmd = makeCommand("admin", {
    canUse: () => false,
});

cmd.executor = async (_a, _f, { message }) => {
    await message.reply(":rotating_light: **Nobody allowed**");
};

export default cmd;
