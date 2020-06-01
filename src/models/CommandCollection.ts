import { Command } from "./Command";

export class CommandCollection {

    private _commands = new Map<string, Command>();
    private _alias = new Map<string, Command>();

    public add(command: Command): { added: boolean, duplicateAlias: string[] } {
        if (this._commands.has(command.name)) {
            return { added: false, duplicateAlias: [] };
        } else {
            this._commands.set(command.name, command);

            const duplicateAlias: string[] = [];
            for (const alias of command.alias) {
                const other = this._alias.get(alias)
                if (other)
                    duplicateAlias.push(alias);
                else
                    this._alias.set(alias, command);
            }

            return { added: true, duplicateAlias }
        }
    }

    public get(name: string): Command | undefined {
        return this._commands.get(name) ?? this._alias.get(name);
    }
}