import { Command } from "./Command";

export class ReadonlyCommandCollection implements Iterable<Command> {
    protected _commands = new Map<string, Command>();
    protected _alias = new Map<string, Command[]>();

    [Symbol.iterator](): Iterator<Command> {
        return this._commands.values();
    }

    /**
     * Returns a command by its name of its alias, or `undefined` if not found.
     * @param name The command's name or alias.
     * @returns The command or `undefined`.
     */
    public get(name: string): Command | undefined {
        const cmd = this._commands.get(name);
        if (cmd) return cmd;
        const aliasCommands = this._alias.get(name);
        if (aliasCommands && aliasCommands.length === 1)
            return aliasCommands[0];
        return undefined;
    }

    /** Returns an iterable of commands in the collection. */
    public values() {
        return this._commands.values();
    }

    /**
     * Determines if this collection contains the alias.
     * @param alias Alias to check.
     * @returns Either or not this collection contains the alias.
     */
    public hasAlias(alias: string): boolean {
        return !!this._alias.get(alias);
    }
}

export class CommandCollection extends ReadonlyCommandCollection {
    /**
     * Adds a command to the collection and returns `true` if successfully added, `false` otherwise.
     * @param command - The command to add.
     * @returns Either or not the command has been added.
     */
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

    /**
     * Remove a command from this collection.
     * @param command The command to remove.
     */
    public delete(command: Command): void {
        this._commands.delete(command.name);
        for (const aliasCommands of command.aliases.map((a) =>
            this._alias.get(a)
        ))
            if (aliasCommands) {
                const i = aliasCommands.indexOf(command);
                if (i !== -1) aliasCommands.splice(i, 1);
            }
    }
}
