export interface Localization {
    readonly help?: HelpLocalization;
    readonly list?: ListLocalization;
    getTypeName(typeName: string): string | undefined;
    getCommand(name: string): CommandLocalization | undefined;
}

export interface HelpLocalization {
    readonly usage?: string;
    readonly argumentUsageHint?: string;
    readonly arguments?: string;
    readonly flags?: string;
    readonly subCommands?: string;
    readonly aliases?: string;
    readonly botPermissions?: string;
    readonly userPermissions?: string;
    readonly examples?: string;
    readonly devOnly?: string;
    readonly guildOnly?: string;
    readonly default?: string;
    readonly commandNotFound?: string;
}

export interface ListLocalization {
    readonly title?: string;
}

export interface CommandLocalization {
    readonly description?: string;
    getArgument(name: string): ArgumentLocalization | undefined;
    getFlag(key: string): FlagLocalization | undefined;
    getSub(name: string): CommandLocalization | undefined;
}

export interface ArgumentLocalization {
    readonly name?: string;
    readonly description?: string;
}

export interface FlagLocalization {
    readonly name?: string;
    readonly description?: string;
}
