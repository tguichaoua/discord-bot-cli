import { Client, ColorResolvable, MessageEmbed } from "discord.js";
import { CommandResult, CommandSet, LogLevel, Logs } from "../src/index";
import env from "./env.json";
import fr from "./fr.json";

Logs.auto(true).minLevel(LogLevel.DEBUG);

const commands = new CommandSet({
    prefix: env.prefix,
    devIDs: env.devIDs,
    skipDevsPermissionsChecking: env.skipDevsPermissionshecking,
    localization: fr,
});

commands.loadCommands("commands", true);

// manually load build-in commands
// because there are supposed to be JS in production
// CommandSet#buildin not load TS files.
commands.loadCommands("../src/commands", true);

const client = new Client();

client.on("ready", () => {
    console.log(`Logged as ${client.user?.username}`);
});

const COLORS: Record<CommandResult["status"], ColorResolvable> = {
    ok: "GREEN",
    error: "RED",
    throttling: "BLACK",
    "client permissions": "AQUA",
    "command not found": "BLURPLE",
    "dev only": "DARK_GOLD",
    "guild only": "YELLOW",
    "no executor": "DARK_BUT_NOT_BLACK",
    "not prefixed": "LUMINOUS_VIVID_PINK",
    "parsing error": "ORANGE",
    "unauthorized user": "NOT_QUITE_BLACK",
};

client.on("message", async message => {
    if (message.system || message.author.bot) return;
    try {
        const result = await commands.parse(message);
        const reply = new MessageEmbed()
            .setTitle(`\`${message.content}\``)
            .setColor(COLORS[result.status])
            .setDescription(
                Object.entries(result)
                    .filter(([k]) => k !== "command")
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("\n"),
            );

        await message.channel.send(reply);
    } catch (e) {
        console.error("This error must not happen !", e);
    }
});

client.login(env.token).catch(e => {
    throw e;
});
