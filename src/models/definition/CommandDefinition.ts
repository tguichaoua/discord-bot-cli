import { ArgDefinition } from "./ArgDefinition";
import { FlagDefinition } from "./FlagDefinition";
import { RestDefinition } from "./RestDefinition";
import { CanUseCommandCb } from "../callbacks/CanUseCommandCb";
import { HelpCb } from "../callbacks/HelpCb";
import { ThrottlingDefinition } from "./ThrottlingDefinition";

export type CommandDefinition = {
    /** alias names for this command. */
    readonly aliases?: string[];
    /** A list of example for this command. */
    readonly examples?: string[];
    /** The description of this command. Used by help command. */
    readonly description?: string;
    /** Arguments that must be passed to the command. */
    readonly args?: { readonly [name: string]: ArgDefinition };
    /** Flags that can be used with this command. */
    readonly flags?: { readonly [name: string]: FlagDefinition };
    /** Define a name and a description for a rest argument. Used for help purpose. */
    readonly rest?: RestDefinition;

    readonly throttling?: ThrottlingDefinition;
    /** If set to true, sub-commands while use this command's throttler. (default is true) */
    readonly useThrottlerForSubs?: boolean;

    /** Determine if a user can use this commands.
     * If the result is true, the command is executed.
     * If the result is a string, the command is not executed and a reply message with the string is returned.
     */
    readonly canUse?: CanUseCommandCb;

    /**
     * If defined, this callback is called when help is needed for this command instead of default help.
     */
    readonly help?: HelpCb;
    /**
     * If set to true and `help` is defined, this command's `help` handler is used for sub command that not defined a `help` handler.
     * (default is false)
     */
    readonly useHelpOnSubs?: boolean;

    /** Sub-commands of this command. */
    readonly subs?: { readonly [name: string]: CommandDefinition };

    /** If set to true, undefined inheritable properties are inherited from parent command. (default is true). */
    readonly inherit?: boolean;
} & CommandSettings;

export type CommandSettings = {
    /** If set to true, this command is not loaded. (default is false). [inheritable] */
    readonly ignore?: boolean;
    /** If set to true, only user registred as dev via `ParseCommand.devIDs` can execute, get help or list this command. (default is false). [inheritable] */
    readonly devOnly?: boolean;
    /** If set to true, this command can only be executed from a server. (default is false). [inheritable] */
    readonly guildOnly?: boolean;
    /** If set to true, the command message will be deleted after command execution. */
    readonly deleteMessage?: boolean;
}