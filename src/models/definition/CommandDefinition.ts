import { PermissionString } from "discord.js";
import { ArgDefinition } from "./ArgDefinition";
import { FlagDefinition } from "./FlagDefinition";
import { RestDefinition } from "./RestDefinition";
import { CanUseCommandHandler } from "../callbacks/CanUseCommandHandler";
import { HelpHandler } from "../callbacks/HelpHandler";
import { ThrottlingDefinition } from "./ThrottlingDefinition";

/** @category Definition */
type CommandDefinitionBase = {
    /** Aliases for this command. */
    readonly aliases?: string[];
    /** Define which permissions the bot's user require to perform the command. */
    readonly clientPermissions?: PermissionString[];
    /**
     * If the command is used from a guild, the user require these permissions to execute this command.
     * Inherited from parent command if not defined.
     */
    readonly userPermissions?: PermissionString[];
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

    readonly throttling?: ThrottlingDefinition | null;
    /** Either or not sub-commands will use the same throttler as this command. (default is true) */
    readonly useThrottlerForSubs?: boolean;

    /** Determine if a user can use this commands.
     * If the result is true, the command is executed.
     * If the result is a string, the command is not executed and a reply message with the string is returned.
     */
    readonly canUse?: CanUseCommandHandler;

    /**
     * If defined, this callback is called when help is needed for this command instead of default help.
     */
    readonly help?: HelpHandler;
    /**
     * If set to true and `help` is defined, this command's `help` handler is used for sub command that not defined a `help` handler.
     * (default is false)
     */
    readonly useHelpOnSubs?: boolean;

    /** Sub-commands of this command. */
    readonly subs?: { readonly [name: string]: CommandDefinition };

    /** Either or not undefined inheritable properties are inherited from parent command. (default is true). */
    readonly inherit?: boolean;
};

/** @category Definition */
export type CommandSettings = {
    /** Either or not this command will be ignored. (default is false). [inheritable] */
    readonly ignore?: boolean;
    /** Either or not this command can only be used by dev (see [[CommandSetOptions.devIDs]]). (default is false). [inheritable] */
    readonly devOnly?: boolean;
    /** Either or not this command can only be used from a guild. (default is false). [inheritable] */
    readonly guildOnly?: boolean;
    /** Either or not the message that executed this command is deleted after the command execution. (default is false). [inheritable] */
    readonly deleteMessage?: boolean;
};

/** @category Definition */
export type CommandDefinition = CommandDefinitionBase & CommandSettings;
