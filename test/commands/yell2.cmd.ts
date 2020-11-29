import { makeCommand } from "../../src/index";

const cmd = makeCommand("yell2", {
    guildOnly: true,
    throttling: {
        count: 3,
        duration: 60 * 10,
        includeAdmins: true,
        scope: "guild",
    },
});

cmd.executor = async (_a, _f, { guild, channel }) => {
    await channel.send(`${guild.roles.everyone} **HAAAAAAAA !**`);
};

export default cmd;
