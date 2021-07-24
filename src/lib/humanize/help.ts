import { MessageEmbed, Message } from "discord.js";

import { ArgDefinition, Command, FlagData, HelpHandler } from "../commands";
import { CommandLocalizator, Localizator } from "../localization";
import { reply } from "../utils/reply";

import { ArgumentRawHelp, CommandRawHelp, FlagRawHelp } from "./types";

// /** @internal */
// export async function defaultHelp(
//     command: Command,
//     localization: Localization,
//     { message, options }: { message: Message; options: CommandSetOptions },
// ) {
//     const embed = embedHelp(command, options.prefix, localization, message);
//     await reply(message, { embed });
// }

export const defaultHelp: HelpHandler = async (command, { message, options }) => {
    const embed = embedHelp(
        command,
        options.prefix,
        Localizator.create(options.localizationResolver, message),
        message,
    );
    await reply(message, { embed });
};

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
export function commandRawHelp(command: Command, localizator: Localizator): CommandRawHelp {
    const commandLocalization = localizator.getCommand(command);
    const fullName = commandFullName(command);
    const description = commandLocalization.description;

    const collection = command.parent?.subs ?? command.commandSet.commands;
    const aliases = command.aliases.filter(a => collection.hasAlias(a));

    const args = Array.from(command.args.entries()).map(([name, arg]) =>
        argRawHelp(arg, name, commandLocalization, localizator),
    );

    const flags = command.flags.map(flag => flagRawHelp(flag, commandLocalization, localizator));

    const subs = Array.from(command.subs.values()).map(c => commandRawHelp(c, localizator));

    const tags: string[] = [];
    if (command.devOnly) tags.push(localizator.help.devOnly);
    if (command.guildOnly) tags.push(localizator.help.guildOnly);

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
    commandLocalizator: CommandLocalizator,
    localizator: Localizator,
): ArgumentRawHelp {
    const argLocalizator = commandLocalizator.getArgument(name); //(localization.args ?? {})[name] ?? {};
    const localizedName = argLocalizator.name;
    const description = argLocalizator.description;
    let usageString: string;
    if (arg.optional) {
        const defaultValue = arg.defaultValue ? ` = ${arg.defaultValue}` : "";
        usageString = `[${localizedName}${defaultValue}]`;
    } else {
        usageString = `<${localizedName}>`;
    }

    return {
        arg,
        typeName: arg.parser.getLocalizedTypeName(localizator),
        name,
        localizedName,
        description,
        usageString,
    };
}

/** @internal */
function flagRawHelp(flag: FlagData, commandLocalizator: CommandLocalizator, localizator: Localizator): FlagRawHelp {
    const flagLocalizator = commandLocalizator.getFlag(flag.key);
    const localizedName = flagLocalizator.name;
    const description = flagLocalizator.description;
    const longUsageString = flag.long ? `--${flag.long}` : undefined;
    const shortUsageString = flag.short ? `-${flag.short}` : undefined;

    return {
        flag,
        typeName: flag.parser?.getLocalizedTypeName(localizator),
        localizedName,
        description,
        longUsageString,
        shortUsageString,
    };
}

/** @internal */
function embedHelp(command: Command, prefix: string, localizator: Localizator, message?: Message) {
    const rawHelp = commandRawHelp(command, localizator);

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
            localizator.help.usage,
            `**\`${usageString}\`**` + (rawHelp.args.length !== 0 ? `\n\n${localizator.help.argumentUsageHint}` : ""),
            false,
        );
    }

    const args = rawHelp.args
        .map(a => `\`${a.name}\` *${a.typeName}*` + (a.description !== "" ? `\n⮩  ${a.description}` : ""))
        .join("\n");
    if (args !== "") embed.addField(localizator.help.arguments, args, true);

    const flags = rawHelp.flags
        .map(
            f =>
                (f.longUsageString ? `\`${f.longUsageString}\`` : "") +
                (f.longUsageString && f.shortUsageString ? " " : "") +
                (f.shortUsageString ? `\`${f.shortUsageString}\`` : "") +
                (f.typeName ? ` *${f.typeName}*` : "") +
                (f.description !== "" ? `\n⮩  ${f.description}` : ""),
        )
        .join("\n");
    if (flags !== "") embed.addField(localizator.help.flags, flags, true);

    const subs = (message ? rawHelp.subs.filter(s => s.command.checkPermissions(message)) : rawHelp.subs)
        .map(s => `\`${s.command.name}\`` + (s.description !== "" ? ` ${s.description}` : ""))
        .join("\n");
    if (subs !== "") embed.addField(localizator.help.subCommands, subs, false);

    const aliases = rawHelp.aliases.map(a => `\`${a}\``).join(" ");
    if (aliases !== "") embed.addField(localizator.help.aliases, aliases, false);

    const clientPermissions = rawHelp.command.clientPermissions.map(p => `\`${p}\``).join(" ");
    if (clientPermissions !== "") embed.addField(localizator.help.botPermissions, clientPermissions, false);

    if (rawHelp.command.userPermissions) {
        const userPermissions = rawHelp.command.userPermissions.map(p => `\`${p}\``).join(" ");
        if (userPermissions !== "") embed.addField(localizator.help.userPermissions, userPermissions, false);
    }

    const exemples = rawHelp.command.examples
        .map(e => `\`${e.example}\`${e.description ? ` — ${e.description}` : ""}`)
        .join("\n");
    if (exemples !== "") embed.addField(localizator.help.examples, exemples, false);

    return embed;
}
