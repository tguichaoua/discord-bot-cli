import fs from "fs";
import path from "path";

import Ajv, { JTDDataType } from "ajv/dist/jtd";

import { resolveFromEntryPoint } from "../../utils/PathUtils";
import { CommandLocalization, Localization, LanguageResolver, LocalizationResolver } from ".";
import { mapToLocalizationResolver } from "./utils";
import { Logger } from "../../logger";

const ajv = new Ajv();

const schema = {
    optionalProperties: {
        typeNames: {
            values: { type: "string" },
        },
        commands: {
            values: { ref: "command" },
        },
        help: {
            optionalProperties: {
                usage: { type: "string" },
                argumentUsageHint: { type: "string" },
                arguments: { type: "string" },
                flags: { type: "string" },
                subCommands: { type: "string" },
                aliases: { type: "string" },
                botPermissions: { type: "string" },
                userPermissions: { type: "string" },
                examples: { type: "string" },
                devOnly: { type: "string" },
                guildOnly: { type: "string" },
                default: { type: "string" },
                commandNotFound: { type: "string" },
            },
        },
        list: {
            optionalProperties: {
                title: { type: "string" },
            },
        },
    },
    definitions: {
        command: {
            optionalProperties: {
                description: { type: "string" },
                arguments: {
                    values: {
                        optionalProperties: {
                            name: { type: "string" },
                            description: { type: "string" },
                        },
                    },
                },
                flags: {
                    values: {
                        optionalProperties: {
                            name: { type: "string" },
                            description: { type: "string" },
                        },
                    },
                },
                subs: {
                    values: { ref: "command" },
                },
            },
        },
    },
} as const;

type JsonLocalizationData = JTDDataType<typeof schema>;

const parseJsonLocalizationData = ajv.compileParser<JsonLocalizationData>(schema);

export function jsonLocalization(localizationPath: string, languageResolver: LanguageResolver): LocalizationResolver {
    const localizations = new Map<string, Localization>();

    try {
        localizationPath = resolveFromEntryPoint(localizationPath);
        const jsonFiles = fs.readdirSync(localizationPath).filter(file => file.endsWith("json"));
        for (const file of jsonFiles) {
            const filePath = path.resolve(path.format({ dir: localizationPath, base: file }));
            const data = parseJsonLocalizationData(fs.readFileSync(filePath, "utf-8"));

            if (data === undefined) {
                Logger.warn(
                    `(${filePath} at ${parseJsonLocalizationData.position}) Invalid JSON format : ${parseJsonLocalizationData.message}`,
                );
            } else {
                localizations.set(path.basename(filePath, ".json"), toLocalization(data));
            }
        }
    } catch (e) {
        Logger.error(e);
    }

    return mapToLocalizationResolver(localizations, languageResolver);
}

function toLocalization(data: JsonLocalizationData): Localization {
    const commands = data.commands && toCommandLocalization(data.commands);
    return {
        help: data.help,
        list: data.list,
        getCommand: name => commands?.get(name),
        getTypeName: typeName => data.typeNames && data.typeNames[typeName],
    };
}

function toCommandLocalization(data: NonNullable<JsonLocalizationData["commands"]>): Map<string, CommandLocalization> {
    return new Map(
        Object.entries(data).map(([k, v]) => {
            const subs = v.subs && toCommandLocalization(v.subs);
            return [
                k,
                {
                    description: v.description,
                    getArgument: name => v.arguments && v.arguments[name],
                    getFlag: key => v.flags && v.flags[key],
                    getSub: name => subs?.get(name),
                },
            ] as const;
        }),
    );
}
