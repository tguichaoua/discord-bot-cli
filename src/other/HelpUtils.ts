import { Command } from "../models/Command";
import { Localization } from "../models/localization/Localization";
import { MessageEmbed } from "discord.js";
import { TypeNameLocalization } from "../models/localization/TypeNameLocalization";
import { FlagDefinition } from "../models/definition/FlagDefinition";
import { ArgDefinition } from "../models/definition/ArgDefinition";
import { CommandRawHelp } from "../models/data/help/CommandRawHelp";
import { ArgumentRawHelp } from "../models/data/help/ArgumentRawHelp";
import { FlagRawHelp } from "../models/data/help/FlagRawHelp";
import { RestRawHelp } from "../models/data/help/RestRawHelp";
import { CommandLocalization } from "../models/localization/CommandLocalization";

export namespace HelpUtils {

    export namespace Command {
        export function getFullName(command: Command) {
            return command.getParents().map(cmd => cmd.name).join(" ");
        }

        export function getRawHelp(command: Command, localization: Localization): CommandRawHelp {
            const commandLocalization = localization.commands[command.name] ?? {};
            const fullName = getFullName(command);
            const description = commandLocalization.description ?? command.description;

            const collection = command.parent?.subs ?? command.commandSet.commands;
            const aliases = command.alias.filter(a => collection.hasAlias(a));

            const args = Array.from(command.args.entries())
                .map(([name, arg]) => Arg.getRawHelp(arg, name, commandLocalization, localization.typeNames));

            const flags = Array.from(command.flags.entries())
                .map(([name, flag]) => Flag.getRawHelp(flag, name, commandLocalization, localization.typeNames));

            const subs = Array.from(command.subs.values())
                .map(c => getRawHelp(c, localization));

            let rest: RestRawHelp | undefined = undefined;
            if (command.rest) {
                const name = commandLocalization?.rest?.name ?? command.rest.name;
                const description = commandLocalization?.rest?.description ?? command.rest.description ?? "";
                const usageString = `[...${name}]`;
                rest = { name, description, usageString };
            }

            return { command, fullName, aliases, description, args, flags, subs, rest };
        }

        export function embedHelp(command: Command, prefix: string, localization: Localization) {
            const rawHelp = getRawHelp(command, localization);

            const embed = new MessageEmbed()
                .setTitle(rawHelp.fullName)
                .setDescription(rawHelp.description + (rawHelp.command.guildOnly ? "\n`guild only`" : ""));

            const usageString = prefix + rawHelp.fullName + " " + rawHelp.args.map(a => a.usageString).join(" ") + (rawHelp.rest ? " " + rawHelp.rest.usageString : "");
            embed.addField("usage", `\`${usageString}\``, false);

            const args = rawHelp.args
                .map(a => `\`${a.name}\` *${a.typeName}*` + (a.description !== "" ? `\n⮩  ${a.description}` : ""))
                .join("\n");
            if (args !== "") embed.addField("arguments", args, true);

            const flags = rawHelp.flags
                .map(f => `\`--${f.name}\`` + (f.flag.shortcut ? ` \`-${f.flag.shortcut}\`` : "") + ` *${f.typeName}*` + (f.description !== "" ? `\n⮩  ${f.description}` : ""))
                .join("\n");
            if (flags !== "") embed.addField("flags", flags, true);

            const subs = rawHelp.subs
                .map(s => `\`${s.command.name}\`` + (s.description !== "" ? `\n⮩  ${s.description}` : ""))
                .join("\n")
            if (subs !== "") embed.addField('sub commands', subs, true);

            const aliases = rawHelp.aliases
                .map(a => `\`${a}\``).join(" ");
            if (aliases !== "") embed.addField("aliases", aliases, true);

            return embed;
        }
    }

    namespace Arg {
        export function getRawHelp(arg: ArgDefinition, name: string, localization: CommandLocalization, typeNames: TypeNameLocalization): ArgumentRawHelp {
            const argLocalization = (localization.args ?? {})[name] ?? {};
            const typeName = typeNames[arg.type];
            const localizedName = argLocalization.name ?? name;
            const description = argLocalization.description ?? arg.description ?? "";
            let usageString: string;
            if (arg.optional) {
                const defaultValue = arg.defaultValue ? ` = ${arg.defaultValue}` : "";
                usageString = `[${localizedName}${defaultValue}]`;
            } else {
                usageString = `<${localizedName}>`;
            }

            return { arg, typeName, name, localizedName, description, usageString };
        }
    }

    namespace Flag {
        export function getRawHelp(flag: FlagDefinition, name: string, localization: CommandLocalization, typeNames: TypeNameLocalization): FlagRawHelp {
            const flagLocalization = (localization.flags ?? {})[name] ?? {};
            const typeName = typeNames[flag.type];
            const localizedName = flagLocalization.name ?? name;
            const description = flagLocalization.description ?? flag.description ?? "";
            const longUsageString = `--${name}`;
            const shortUsageString = flag.shortcut ? `-${flag.shortcut}` : undefined;

            return { flag, typeName, name, localizedName, description, longUsageString, shortUsageString };
        }
    }
}