import { Command, CommandQuery } from "discord-bot-cli";

module.exports = new Command("$NAME$", {
    description: "...",
    signatures: [
        {
            executor: executor,
        }
    ]
});

async function executor(query: CommandQuery) {

}