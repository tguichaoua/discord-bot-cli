import { Command } from "../models/Command";
import { Localization } from "../models/localization/Localization";
import { MessageEmbed } from "discord.js";
import { Arg } from "../models/parsable/Arg";
import { ParsableLocalization } from "../models/localization/ParsableLocalization";
import { TypeNameLocalization } from "../models/localization/TypeNameLocalization";
import { Signature } from "../models/Signature";
import { Flag } from "../models/parsable/Flag";

export namespace HelpUtility {

    export namespace Command {
        export function fullName(command: Command) {
            return command.getParents().map(cmd => cmd.name).join(" ");
        }

        export function embedHelp(command: Command, prefix: string, localization: Localization) {
            const loc = localization.commands[command.name] ?? {};
            const name = fullName(command);
            const description = loc.description ?? command.description;

            const embed = new MessageEmbed()
                .setTitle(prefix + name)
                .setDescription(description);

            // if there is only 1 signature without any argument (nor rest), don't display this signature.
            if (!(command.signatures.length === 1 && command.signatures[0].arguments.length === 0 && !command.signatures[0].rest)) {
                for (const s of command.signatures) {
                    const description =
                        Signature.argumentsDescription(s, localization) +
                        "\n" +
                        Signature.flagsDescription(s, localization);
                    embed.addField(
                        prefix + name + ' ' + Signature.usageString(s, localization),
                        description.length === 0 ? "*" : description
                    );
                }
            }

            let str = '';
            for (const cmd of command.getSubs())
                str += `**${cmd.name}** ${localization.commands[cmd.name]?.description ?? cmd.description}\n`;
            if (str !== '')
                embed.addField('Sub Commands', str);

            return embed;
        }
    }

    export namespace Signature {
        export function usageString(signature: Signature, localization?: Localization) {
            const loc = localization?.commands[signature.command.name];
            signature.arguments
                .map(a => Arg.usageString(a, loc?.args ? loc.args[a.name] : undefined))
                .join(" ")
                + (signature.rest ? `[...${loc?.rest?.name ?? signature.rest.name}]` : "");
        }

        export function argumentsDescription(signature: Signature, localization: Localization) {
            const loc = localization.commands[signature.command.name];
            // make sure that the string is not empty
            return signature.arguments
                .map(a => Arg.descriptionString(a, localization.typeNames, loc?.args ? loc.args[a.name] : undefined))
                .join("\n")
                + (signature.rest ? `\n**[...${loc?.rest?.name ?? signature.rest.name}]** - ${loc?.rest?.description ?? signature.rest.description}` : "");
        }

        export function flagsDescription(signature: Signature, localization: Localization) {
            const loc = localization.commands[signature.command.name];
            // make sure that the string is not empty
            return Array.from(signature.getFlags())
                .map(f => Flag.descriptionString(f, localization.typeNames, loc?.args ? loc.args[f.name] : undefined))
                .join('\n');
        }
    }

    export namespace Arg {
        export function usageString(argument: Arg, localization?: ParsableLocalization) {
            if (argument.isOptional) {
                const val = argument.defaultValue ? ` = ${argument.defaultValue}` : '';
                return `[${localization?.name ?? argument.name}${val}]`;
            } else {
                return `<${localization?.name ?? argument.name}>`;
            }
        }

        export function descriptionString(argument: Arg, typeNameLocalization: TypeNameLocalization, localization?: ParsableLocalization, ) {
            return `**${usageString(argument, localization)}** *(${typeNameLocalization[argument.type]})* - ${localization?.description ?? argument.description}`;
        }
    }

    export namespace Flag {
        export function descriptionString(flag: Flag, typeNameLocalization: TypeNameLocalization, localization?: ParsableLocalization) {
            return `**--${flag.name}${(flag.shortcut ? ` -${flag.shortcut}` : "")}** *(${typeNameLocalization[flag.type]})* - ${localization?.description ?? flag.description}`;
        }
    }
}