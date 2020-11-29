import { makeCommand } from "../../src/index";

const cmd = makeCommand("example", {
    aliases: ["ex"],
    examples: [
        "example 1",
        ["example 2", "Lorem ipsum dolor sit amet."],
        { example: "example 3", description: "Lorem ipsum dolor sit amet." },
    ],
});

export default cmd;
