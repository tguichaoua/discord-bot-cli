import { makeCommand } from "../../src/index";

const cmd = makeCommand("yell", {
    userPermissions: ["MENTION_EVERYONE"],
    guildOnly: true,
});

cmd.executor = async (_a, _f, { guild, channel }) => {
    await channel.send(`${guild.roles.everyone} **HAAAAAAAA !**`);
};

export default cmd;
