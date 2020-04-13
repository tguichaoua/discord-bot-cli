# discord-bot-cli
An easy way to build a command-based discord bot

<a href="https://www.npmjs.com/package/discord-bot-cli" target="_blank"><img src="https://img.shields.io/npm/v/discord-bot-cli"/></a>
<img src="https://img.shields.io/github/last-commit/baanloh/discord-bot-cli"/>

## Dependency
<img src="https://img.shields.io/npm/dependency-version/discord-bot-cli/discord.js"/>

## Install
`npm i discord-bot-cli`

## Documentation
<a href="https://baanloh.github.io/discord-bot-cli/">Docs</a>

## Usage
```typescript
// === include dependencies =================================================
import Discord from "discord.js";
import { CommandSet, CommandResultStatus } from "discord-bot-cli";

// === setup objects ========================================================
const client = new Discord.Client();
const commands = new CommandSet();

commands.loadCommands("./cmds/");
commands.buildin("help", "list"); // or commands.buildin("all");

// === define const =========================================================
const context = {}; // put here context data like database

const commandParseOptions = CommandSet.createParseOption(".");

// === Discord events ==========================================

client.on("ready", () => {
    console.log("Discord bot is ready !");
});

client.on("message", async msg => {

    if (msg.author.bot) return; // ignore message from bots

    console.log(">", msg.content);
    const result = await commands.parse(msg, context, commandParseOptions);

    switch (result.status) {
        case CommandResultStatus.OK:
            console.log("=", result.result);
            break;
        case CommandResultStatus.ERROR:
            console.error("error", result.error);
            break;
        default:
            console.log("@", result.status);
    }
});

// === init app ==================================================
(async function () {
    try {
        console.log("INIT | init commands");
        await commands.init(context);

        console.log("INIT | loging to Discord");
        await client.login(process.env.DISCORD_TOKEN);
    } catch (e) {
        console.error("on init |", e);
    }
})();
```

## CLI

package.json
```jsonc
"scripts": {
    // ...
    "cmd": "dbc cmd -l ts", // create a command file for typescript
    "cmd": "dbc cmd -l js", // create a command file for javascript
    // ...
}
```

Run the following command to create a new file with skeleton for command.  
`npm run cmd -- path/to/folder/commandName`


