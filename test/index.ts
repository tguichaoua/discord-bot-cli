import { Client } from "discord.js";
import { CommandSet, HelpUtils, enableDebugLogs } from "../src/index";
import env from "./env.json";

enableDebugLogs();

const commands = new CommandSet({
    prefix: env.prefix,
    devIDs: env.devIDs,
    skipDevsPermissionsChecking: env.skipDevsPermissionshecking,
});

// commands.helpHandler = async (command, { message, options }) => {
//     const help = HelpUtils.commandRawHelp(command, options.localization);
//     const text = `
// **Command name**: ${command.name}
// **Full name**: ${help.fullName}
// `;
//     await message.reply(text);
// };

commands.loadCommands("commands", true);

// manually load build-in commands
// because there are supposed to be JS in production
// CommandSet#buildin not load TS files.
commands.loadCommands("../src/commands", true);

const client = new Client();

client.on("ready", () => {
    console.log(`Logged as ${client.user?.username}`);
});

client.on("message", async message => {
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

client.login(env.token).catch(e => {
    throw e;
});
