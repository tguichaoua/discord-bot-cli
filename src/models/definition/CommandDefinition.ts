import { ArgDefinition } from "./ArgDefinition";
import { FlagDefinition } from "./FlagDefinition";

export interface CommandDefinition {
    /** The description of this command. Used by help command. */
    description?: string;
    /** Arguments that must be passed to the command. */
    args?: { [name: string]: ArgDefinition };
    /** Flags that can be used with this command. */
    flags?: { [name: string]: FlagDefinition };
    /** Define a name and a description for a rest argument. Used for help purpose. */
    rest?: { name: string, description?: string };
    
    /** Sub-commands of this command. */
    subs?: { [name: string]: CommandDefinition };

    /** If set to true, undefined inheritable properties are inherited from parent command. (default is false). */
    inherit?: boolean;
    /** If set to true, this command is not loaded. (default is false). [inheritable] */
    ignore?: boolean;
    /** If set to true, the message that trigger this command is automatically deleted. (default is true). [inheritable] */
    deleteCommandMessage?: boolean;
    /** If set to true, only user registred as dev via `ParseCommand.devIDs` can execute, get help or list this command. (default is false). [inheritable] */
    dev?: boolean;
    /** If set to true, this command can only be executed from a server. (default is false). [inheritable] */
    guildOnly?: boolean;
}