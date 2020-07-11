import { Client } from "discord.js";
import { CommandSet } from "../src/index";
import env from "./env.json";

const commands = new CommandSet({ prefix: env.prefix, devIDs: env.devIDs });
commands.loadCommands("commands");

// manually load build-in commands
// because there are supposed to be JS in production
// CommandSet#buildin not load TS files.
commands.loadCommands("../src/commands", true);

const client = new Client();

client.on("ready", () => {
    console.log(`Logged as ${client.user!.username}`);
});

client.on("message", async (message) => {
    if (message.system || message.author.bot) return;
    try {
        const result = await commands.parse(message);
        console.log("> ", message.content);
        switch (result.status) {
            case "error":
                console.error("[ERROR]", result.error);
                break;
            case "ok":
                console.log("[OK]", result.result);
                break;
            default:
                console.log(result);
        }
    } catch (e) {
        console.error("This error must not happen !", e);
    }
});

client.login(env.token).catch((e) => {
    throw e;
});
