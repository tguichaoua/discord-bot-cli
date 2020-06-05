# discord-bot-cli
`discord-bot-cli` is a npm package based on [`discord.js`](https://www.npmjs.com/package/discord.js) to provide tools to make easy to create a command based bot for Discord.

<a href="https://www.npmjs.com/package/discord-bot-cli" target="_blank"><img src="https://img.shields.io/npm/v/discord-bot-cli"/></a>
<img src="https://img.shields.io/github/last-commit/baanloh/discord-bot-cli"/>

## Install
`npm i discord-bot-cli`  
Check the [wiki](https://github.com/baanloh/discord-bot-cli/wiki/Installation-and-Setup) for more details.

## Documentation
<a href="https://baanloh.github.io/discord-bot-cli/v3/index.html">Docs</a><br>
<a href="https://github.com/baanloh/discord-bot-cli/wiki">Wiki</a>

## Usage
```typescript
// === include dependencies =================================================
import Discord from "discord.js";
import { CommandSet } from "discord-bot-cli";

// === setup objects ========================================================
const client = new Discord.Client();
const commands = new CommandSet({ prefix: "." });

commands.loadCommands("./commands/");
commands.buildin("all");

// === Discord events ==========================================

client.on("ready", () => {
    console.log("Discord bot is ready !");
});

client.on("message", async msg => {
    if (msg.author.bot) return; // ignore message from bots

    await commands.parse(msg);
});

client.login(process.env.DISCORD_TOKEN);
```
