import { makeCommand } from "../other/makeCommand";
import { Command } from "..";
import { Logger } from "../logger";
import { Parsers } from "../models/parsers";

const cmd = makeCommand("cmd", {
    devOnly: true,
    description: "Manage commands",
    subs: {
        reload: {
            aliases: ["r"],
            description: "Reload a command",
            args: {
                command: {
                    parser: Parsers.string,
                    description: "Name of the command to reload.",
                },
            },
        },
        throttling: {
            aliases: ["t"],
            description: "Get data about command throttler",
            args: { commandName: { parser: Parsers.rest } },
            flags: {
                reset: {
                    description: "Reset the trottler of the target command",
                },
                resetAll: {
                    short: "R",
                    description: "Reset the trottler of the target command and its sub-commands",
                },
                scope: {
                    parser: Parsers.string,
                    description: "Perform action on specific scope (comma separated list).",
                },
            },
            examples: [
                "cmd t foo",
                "cmd t foo -r",
                "cmd t foo -R",
                "cmd t foo -s 123123123,13123213,151868723",
                "cmd t foo -rs 123123123,13123213,151868723",
                "cmd t foo -Rs 123123123,13123213,151868723",
            ],
        },
    },
});

cmd.subs.reload.executor = async ({ command }, _, { commandSet, message }) => {
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

cmd.subs.throttling.executor = async (_, { reset, resetAll, scope }, { commandSet, rest, channel }) => {
    const commandName = `\`${rest.join(" ")}\``;
    const { command } = commandSet.resolve(rest);
    if (!command) {
        await channel.send(`:x: Command ${commandName} not found.`);
        return;
    }

    const throttler = command.throttler;
    if (!throttler) {
        await channel.send(`:x: Throttling is not enabled on ${commandName}.`);
        return;
    }

    if (scope) {
        const ids = scope
            .split(",")
            .filter(s => s.length !== 0)
            .map(s => s.trim());

        if (resetAll) {
            const resetAllThrottling = (cmd: Command) => {
                for (const c of cmd.subs) resetAllThrottling(c);
                const t = cmd.throttler;
                if (t) for (const id of ids) t.reset(id);
            };
            resetAllThrottling(command);
            await channel.send(
                ":white_check_mark: Throttlers for the following scopes have been reset: " +
                    ids.map(s => `\`${s}\``).join(", "),
            );
            return;
        }

        if (reset) {
            for (const id of ids) throttler.reset(id);
            await channel.send(
                ":white_check_mark: Throttler for the following scopes have been reset: " +
                    ids.map(s => `\`${s}\``).join(", "),
            );
            return;
        }

        let res = "";
        for (const id of ids) {
            res += `**${id}**
**Usage**: ${throttler.getCurrent(id)} / ${throttler.count}
**Cooldown**: ${throttler.getCooldown(id)} / ${throttler.duration}\n`;
        }
        await channel.send(res);
    } else {
        if (resetAll) {
            const resetAllThrottling = (cmd: Command) => {
                for (const c of cmd.subs) resetAllThrottling(c);
                cmd.throttler?.reset();
            };
            resetAllThrottling(command);
            await channel.send(":white_check_mark: Throttlers have been reset.");
            return;
        }

        if (reset) {
            throttler.reset();
            await channel.send(":white_check_mark: Throttler have been reset.");
            return;
        }

        if (throttler.scope === "global") {
            await channel.send(`
**Command**: ${commandName}
**Usage**: ${throttler.getCurrent("")} / ${throttler.count}
**Cooldown**: ${throttler.getCooldown("")} / ${throttler.duration} seconds`);
        } else {
            await channel.send(`${commandName} throttler scope is \`${throttler.scope}\``);
        }
    }
};

export default cmd;
