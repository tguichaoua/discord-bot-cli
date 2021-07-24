import { Message } from "discord.js";
import { ArgDefinition, Command, FlagData } from "../command";

import {
    ArgumentLocalization,
    CommandLocalization,
    FlagLocalization,
    HelpLocalization,
    ListLocalization,
    Localization,
} from "./Localization";
import { LocalizationResolver } from "./resolvers";

export class Localizator {
    public readonly help: HelpLocalizator;
    public readonly list: ListLocalizator;

    private constructor(private readonly localization: Localization | undefined) {
        this.help = new HelpLocalizator(this.localization?.help);
        this.list = new ListLocalizator(this.localization?.list);
    }

    static create(resolver: LocalizationResolver | undefined, message: Message) {
        return new Localizator(resolver ? resolver(message.member ?? message.author) : undefined);
    }

    getTypeName(typeName: string): string {
        return (this.localization?.getTypeName ? this.localization.getTypeName(typeName) : undefined) ?? typeName;
    }

    getCommand(command: Command): CommandLocalizator {
        const path = command.getParents().map(c => c.name);
        let commandLocalization = this.localization?.getCommand ? this.localization.getCommand(path[0]!) : undefined; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        for (let i = 1; i < path.length && commandLocalization; ++i) {
            commandLocalization = commandLocalization.getSub ? commandLocalization.getSub(path[i]!) : undefined; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        }
        return new CommandLocalizator(command, commandLocalization);
    }
}

export class CommandLocalizator {
    constructor(private readonly command: Command, private readonly localization: CommandLocalization | undefined) {}

    get description(): string {
        return this.localization?.description ?? this.command.description;
    }

    getArgument(name: string): ArgumentLocalizator {
        const def = this.command.args.get(name);
        if (!def) throw new Error(`No argument with name '${name}'`);
        return new ArgumentLocalizator(
            name,
            def,
            this.localization?.getArgument ? this.localization.getArgument(name) : undefined,
        );
    }

    getFlag(key: string): FlagLocalizator {
        const def = this.command.flags.find(f => f.key === key);
        if (!def) throw new Error(`No flag with key 'key'`);
        return new FlagLocalizator(def, this.localization?.getFlag ? this.localization.getFlag(key) : undefined);
    }
}

export class ArgumentLocalizator {
    constructor(
        private readonly _name: string,
        private readonly arg: ArgDefinition,
        private readonly localization: ArgumentLocalization | undefined,
    ) {}

    get name(): string {
        return this.localization?.name ?? this._name;
    }

    get description(): string {
        return this.localization?.description ?? this.arg.description ?? "";
    }
}

export class FlagLocalizator {
    constructor(private readonly flag: FlagData, private readonly localization: FlagLocalization | undefined) {}

    get name(): string {
        return this.localization?.name ?? this.flag.long ?? this.flag.key;
    }

    get description(): string {
        return this.localization?.description ?? this.flag.description ?? "";
    }
}

export class HelpLocalizator {
    constructor(private readonly localization: HelpLocalization | undefined) {}

    get usage(): string {
        return this.localization?.usage ?? "Usage";
    }

    get argumentUsageHint(): string {
        return this.localization?.argumentUsageHint ?? "Required: `<>` | Optional: `[]`";
    }

    get arguments(): string {
        return this.localization?.arguments ?? "Arguments";
    }

    get flags(): string {
        return this.localization?.flags ?? "Flags";
    }

    get subCommands(): string {
        return this.localization?.subCommands ?? "Sub commands";
    }

    get aliases(): string {
        return this.localization?.aliases ?? "Aliases";
    }

    get botPermissions(): string {
        return this.localization?.botPermissions ?? "Required Bot Permissions";
    }

    get userPermissions(): string {
        return this.localization?.userPermissions ?? "Required  Permissions";
    }

    get examples(): string {
        return this.localization?.examples ?? "Examples";
    }

    get devOnly(): string {
        return this.localization?.devOnly ?? "Dev Only";
    }

    get guildOnly(): string {
        return this.localization?.guildOnly ?? "Guild Only";
    }

    get default(): string {
        return (
            this.localization?.default ??
            "Type `{{prefix}}list` to get a list of all commands or `{{prefix}}help <command name>` to get help on a command."
        );
    }

    get commandNotFound(): string {
        return this.localization?.commandNotFound ?? "The command/sub-command `{{command}}` cannot be found.";
    }
}

export class ListLocalizator {
    constructor(private readonly localization: ListLocalization | undefined) {}

    get title(): string {
        return this.localization?.title ?? "Command List";
    }
}
