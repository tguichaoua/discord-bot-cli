import { Command } from "./Command";

export class ReadonlyCommandCollection implements Iterable<Command> {
    protected _commands = new Map<string, Command>();
    protected _alias = new Map<string, Command[]>();

    [Symbol.iterator](): Iterator<Command> {
        return this._commands.values();
    }

    public get(name: string): Command | undefined {
        const cmd = this._commands.get(name);
        if (cmd) return cmd;
        const aliasCommands = this._alias.get(name);
        if (aliasCommands && aliasCommands.length === 1) return aliasCommands[0];
        return undefined;
    }

    public values() { return this._commands.values(); }

    public hasAlias(alias: string): boolean {
        return !!this._alias.get(alias);
    }
}

export class CommandCollection extends ReadonlyCommandCollection {
    public add(command: Command): boolean {
        if (this._commands.has(command.name)) {
            return false;
        } else {
            this._commands.set(command.name, command);

            for (const alias of command.aliases) {
                const aliasCommands = this._alias.get(alias);
                if (aliasCommands) aliasCommands.push(command);
                else this._alias.set(alias, [command]);
            }

            return true;
        }
    }

    public delete(command: Command): void {
        this._commands.delete(command.name);
        for (const aliasCommands of command.aliases.map(a => this._alias.get(a)))
            if (aliasCommands) {
                const i = aliasCommands.indexOf(command);
                if (i !== -1) aliasCommands.splice(i, 1);
            }
    }
}