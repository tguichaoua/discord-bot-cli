import { makeCommand, Parsers } from "../../dist/lib";

const cmd = makeCommand("hello", {
    description: "Send a hello message to either a user (in DM) or in a channel.",
    args: {
        where: {
            parser: Parsers.union(Parsers.user.discriminate("user"), Parsers.channel("text").discriminate("channel")),
        },
    },
});

cmd.executor = async ({ where }) => {
    switch (where.variant) {
        case "user":
            await where.value.send(`Hello ${where.value.username} !`);
            break;
        case "channel":
            await where.value.send("Hello there !");
            break;
    }
};

export default cmd;
