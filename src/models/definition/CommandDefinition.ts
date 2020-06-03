import { ArgDefinition } from "./ArgDefinition";
import { FlagDefinition } from "./FlagDefinition";
import { RestDefinition } from "./RestDefinition";

export interface CommandDefinition {
    /** alias names for this command */
    readonly alias?: string[];
    /** The description of this command. Used by help command. */
    readonly description?: string;
    /** Arguments that must be passed to the command. */
    readonly args?: { readonly [name: string]: ArgDefinition };
    /** Flags that can be used with this command. */
    readonly flags?: { readonly [name: string]: FlagDefinition };
    /** Define a name and a description for a rest argument. Used for help purpose. */
    readonly rest?: RestDefinition;

    /** Sub-commands of this command. */
    readonly subs?: { readonly [name: string]: CommandDefinition };

    /** If set to true, undefined inheritable properties are inherited from parent command. (default is false). */
    readonly inherit?: boolean;
    /** If set to true, this command is not loaded. (default is false). [inheritable] */
    readonly ignore?: boolean;
    /** If set to true, only user registred as dev via `ParseCommand.devIDs` can execute, get help or list this command. (default is false). [inheritable] */
    readonly devOnly?: boolean;
    /** If set to true, this command can only be executed from a server. (default is false). [inheritable] */
    readonly guildOnly?: boolean;
}