import { Command } from "./Command";

export class ReadonlyCommandCollection {
    protected _commands = new Map<string, Command>();
    protected _alias = new Map<string, Command | undefined>();

    public get(name: string): Command | undefined {
        return this._commands.get(name) ?? this._alias.get(name);
    }

    public values() { return this._commands.values(); }
}

export class CommandCollection extends ReadonlyCommandCollection {
    public add(command: Command): boolean {
        if (this._commands.has(command.name)) {
            return false;
        } else {
            this._commands.set(command.name, command);

            for (const alias of command.alias) {
                if (this._alias.has(alias))
                    this._alias.set(alias, undefined);
                else
                    this._alias.set(alias, command);
            }

            return true;
        }
    }
}