# discord-bot-cli
An easy way to build a command-based discord bot

<a href="https://www.npmjs.com/package/discord-bot-cli" target="_blank"><img src="https://img.shields.io/npm/v/discord-bot-cli"/></a>
<img src="https://img.shields.io/github/last-commit/baanloh/discord-bot-cli"/>

## Install
`npm i discord-bot-cli`

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

## CLI

package.json
```jsonc
"scripts": {
    // ...
    "cmd": "dbc cmd -l ts", // create a command file for typescript
    "cmd": "dbc cmd -l js", // create a command file for javascript
    "loc": "dbc loc" // create a localization file
    // ...
}
```

Run the following command to create a new file with skeleton for command.  
`npm run cmd -- path/to/folder/commandName`

Run the following command to create a new localization file.  
`npm run loc -- path/to/folder/filename_without_extension`
