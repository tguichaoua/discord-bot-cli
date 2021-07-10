import { makeCommand, Parsers } from "../../src/index";

const cmd = makeCommand("tag", {
    args: {
        a: {
            parser: Parsers.union(
                Parsers.channel("text").map(value => {
                    return { variant: "channel" as const, value };
                }),
                Parsers.user.map(value => {
                    return { variant: "user" as const, value };
                }),
            ),
        },
        b: {
            parser: Parsers.union(Parsers.channel("text").discriminate("channel"), Parsers.user.discriminate("user")),
        },
    },
});

cmd.executor = async ({ a, b }, _f, { message }) => {
    const m = `a is ${a.variant}\nb is ${b.variant}`;
    await message.channel.send(m);

    switch (b.variant) {
        case "channel":
            await b.value.send("Hello everyone !");
            break;
        case "user":
            await b.value.send(`Hello ${b.value.username} !`);
    }
};

export default cmd;
