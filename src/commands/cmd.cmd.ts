import { makeCommand } from "../other/makeCommand";

const cmd = makeCommand("cmd", {
    devOnly: true,
    description: "Manage commands",
    subs: {
        reload: {
            aliases: ["r"],
            description: "Reload a command",
            args: { command: { type: "string", description: "Name of the command to reload." } }
        }
    }
});

cmd.subs.reload.executor = async ({ command }, { }, { commandSet, message }) => {
    const cmd = commandSet.get(command);
    if (!cmd) {
        await message.channel.send(":x: Command not found").catch(() => { });
        return;
    }

    try {
        commandSet.reload(cmd);
        await message.channel.send(":white_check_mark: Command reloaded").catch(() => { });
    } catch (e) {
        await message.channel.send(`:x: Fail to reload command \`\`\`\n${e}\n\`\`\``).catch(() => { });
    }
}

export default cmd;