import { makeCommand } from "../other/makeCommand";
import { Command } from "..";
import { Logger } from "../logger";

const cmd = makeCommand("cmd", {
    devOnly: true,
    description: "Manage commands",
    subs: {
        reload: {
            aliases: ["r"],
            description: "Reload a command",
            args: {
                command: {
                    type: "string",
                    description: "Name of the command to reload.",
                },
            },
        },
        throttling: {
            aliases: ["t"],
            description: "Get data about command throttler",
            rest: { type: "string", name: "command" },
            flags: {
                reset: {
                    type: "boolean",
                    defaultValue: false,
                    shortcut: "r",
                    description: "Reset the trottler",
                },
                "reset-all": {
                    type: "boolean",
                    defaultValue: false,
                    shortcut: "R",
                    description: "Reset all throttlers",
                },
            },
            examples: ["cmd t foo", "cmd t foo -r", "cmd t foo -R", "cmd t -R"],
        },
    },
});

cmd.subs.reload.executor = async ({ command }, _f, { commandSet, message }) => {
    const cmd = commandSet.commands.get(command);
    if (!cmd) {
        await message.channel.send(":x: Command not found").catch(Logger.error);
        return;
    }

    try {
        commandSet.reload(cmd);
        await message.channel.send(":white_check_mark: Command reloaded").catch(Logger.error);
    } catch (e) {
        await message.channel.send(`:x: Fail to reload command \`\`\`\n${e}\n\`\`\``).catch(Logger.error);
    }
};

cmd.subs.throttling.executor = async (_, { reset, "reset-all": resetAll }, { commandSet, message, rest }) => {
    function resetAllThrottling(cmd: Command) {
        for (const sub of cmd.subs) resetAllThrottling(sub);
        cmd.throttler?.reset();
    }

    if (resetAll && rest.length === 0) {
        for (const c of commandSet.commands) resetAllThrottling(c);
        await message.channel.send(":white_check_mark: All throttlers has been reset.");
        return;
    }

    const commandName = `\`${rest.join(" ")}\``;
    const { command } = commandSet.resolve(rest);
    if (!command) {
        await message.channel.send(`:x: Command ${commandName} not found.`);
        return;
    }

    if (resetAll) {
        resetAllThrottling(command);
        await message.channel.send(`:white_check_mark: All throttlers of ${commandName} has been reset.`);
        return;
    }

    const throttler = command.throttler;
    if (!throttler) {
        await message.channel.send(`:x: Throttling is not enabled on ${commandName}.`);
        return;
    }

    if (reset) {
        throttler.reset();
        await message.channel.send(`:white_check_mark: Throttling has been reset for ${commandName}.`);
    } else {
        await message.channel.send(`
**Command**: ${commandName}
**Usage**: ${throttler.current} / ${throttler.count}
**Cooldown**: ${throttler.cooldown} / ${throttler.duration} seconds
        `);
    }
};

export default cmd;
