import { Command } from "../models/Command";
import { Localization } from "../models/localization/Localization";
import { MessageEmbed, Message } from "discord.js";
import { FlagDef } from "../models/definition/FlagDefinition";
import { ArgDefinition } from "../models/definition/ArgDefinition";
import { CommandRawHelp } from "../models/data/help/CommandRawHelp";
import { ArgumentRawHelp } from "../models/data/help/ArgumentRawHelp";
import { FlagRawHelp } from "../models/data/help/FlagRawHelp";
import { CommandLocalization } from "../models/localization/CommandLocalization";
import { CommandSetOptions } from "../models/CommandSetOptions";
import { reply } from "../utils/reply";

/** @internal */
export async function defaultHelp(
    command: Command,
    { message, options }: { message: Message; options: CommandSetOptions },
) {
    const embed = embedHelp(command, options.prefix, options.localization, message);
    await reply(message, { embed });
}

/**
 * Get the command full name.
 * @category Utils
 * @param command
 * @returns The command's full name.
 */
export function commandFullName(command: Command) {
    return command
        .getParents()
        .map(cmd => cmd.name)
        .join(" ");
}

/**
 * Extracts raw data for command help.
 * @category Utils
 * @param command
 * @param localization
 * @returns Raw help datas.
 */
export function commandRawHelp(command: Command, localization: Localization): CommandRawHelp {
    const commandLocalization = localization.commands[command.name] ?? {};
    const fullName = commandFullName(command);
    const description = commandLocalization.description ?? command.description;

    const collection = command.parent?.subs ?? command.commandSet.commands;
    const aliases = command.aliases.filter(a => collection.hasAlias(a));

    const args = Array.from(command.args.entries()).map(([name, arg]) =>
        argRawHelp(arg, name, commandLocalization, localization.typeNames),
    );

    const flags = Array.from(command.flags.entries()).map(([name, flag]) =>
        flagRawHelp(flag, name, commandLocalization, localization.typeNames),
    );

    const subs = Array.from(command.subs.values()).map(c => commandRawHelp(c, localization));

    const tags: string[] = [];
    if (command.devOnly) tags.push(localization.help.tags.devOnly);
    if (command.guildOnly) tags.push(localization.help.tags.guildOnly);

    return {
        command,
        fullName,
        aliases,
        description,
        args,
        flags,
        subs,
        tags,
    };
}

/** @internal */
function argRawHelp(
    arg: ArgDefinition,
    name: string,
    localization: CommandLocalization,
    typeNamesLocalization: Record<string, string>,
): ArgumentRawHelp {
    const argLocalization = (localization.args ?? {})[name] ?? {};
    const localizedName = argLocalization.name ?? name;
    const description = argLocalization.description ?? arg.description ?? "";
    let usageString: string;
    if (arg.optional) {
        const defaultValue = arg.defaultValue ? ` = ${arg.defaultValue}` : "";
        usageString = `[${localizedName}${defaultValue}]`;
    } else {
        usageString = `<${localizedName}>`;
    }

    return {
        arg,
        typeName: arg.parser._getLocalizedTypeName(typeNamesLocalization),
        name,
        localizedName,
        description,
        usageString,
    };
}

/** @internal */
function flagRawHelp(
    flag: FlagDef,
    name: string,
    localization: CommandLocalization,
    typeNamesLocalization: Record<string, string>,
): FlagRawHelp {
    const flagLocalization = (localization.flags ?? {})[name] ?? {};
    const localizedName = flagLocalization.name ?? name;
    const description = flagLocalization.description ?? flag.description ?? "";
    const longUsageString = `--${name}`;
    const shortUsageString = flag.shortcut ? `-${flag.shortcut}` : undefined;

    return {
        flag,
        typeName:
            flag.parser?._getLocalizedTypeName(typeNamesLocalization) ?? typeNamesLocalization["boolean"] ?? "boolean",
        name,
        localizedName,
        description,
        longUsageString,
        shortUsageString,
    };
}

/** @internal */
function embedHelp(command: Command, prefix: string, localization: Localization, message?: Message) {
    const rawHelp = commandRawHelp(command, localization);

    const embed = new MessageEmbed()
        .setTitle(rawHelp.fullName)
        .setDescription(
            rawHelp.description +
                (rawHelp.tags.length === 0 ? "" : "\n\n" + rawHelp.tags.map(t => `\`${t}\``).join(" ")),
        );

    if (command.hasExecutor) {
        const usageString =
            prefix +
            rawHelp.fullName +
            (rawHelp.args.length === 0 ? "" : " " + rawHelp.args.map(a => a.usageString).join(" "));
        embed.addField(
            localization.help.usage,
            `**\`${usageString}\`**` + (rawHelp.args.length !== 0 ? `\n\n${localization.help.argUsageHint}` : ""),
            false,
        );
    }

    const args = rawHelp.args
        .map(a => `\`${a.name}\` *${a.typeName}*` + (a.description !== "" ? `\n⮩  ${a.description}` : ""))
        .join("\n");
    if (args !== "") embed.addField(localization.help.arguments, args, true);

    const flags = rawHelp.flags
        .map(
            f =>
                `\`--${f.name}\`` +
                (f.flag.shortcut ? ` \`-${f.flag.shortcut}\`` : "") +
                ` *${f.typeName}*` +
                (f.description !== "" ? `\n⮩  ${f.description}` : ""),
        )
        .join("\n");
    if (flags !== "") embed.addField(localization.help.flags, flags, true);

    const subs = (message ? rawHelp.subs.filter(s => s.command.checkPermissions(message)) : rawHelp.subs)
        .map(s => `\`${s.command.name}\`` + (s.description !== "" ? ` ${s.description}` : ""))
        .join("\n");
    if (subs !== "") embed.addField(localization.help.subCommands, subs, false);

    const aliases = rawHelp.aliases.map(a => `\`${a}\``).join(" ");
    if (aliases !== "") embed.addField(localization.help.aliases, aliases, false);

    const clientPermissions = rawHelp.command.clientPermissions.map(p => `\`${p}\``).join(" ");
    if (clientPermissions !== "") embed.addField(localization.help.bot_permissions, clientPermissions, false);

    if (rawHelp.command.userPermissions) {
        const userPermissions = rawHelp.command.userPermissions.map(p => `\`${p}\``).join(" ");
        if (userPermissions !== "") embed.addField(localization.help.user_permissions, userPermissions, false);
    }

    const exemples = rawHelp.command.examples
        .map(e => `\`${e.example}\`${e.description ? ` — ${e.description}` : ""}`)
        .join("\n");
    if (exemples !== "") embed.addField(localization.help.examples, exemples, false);

    return embed;
}
