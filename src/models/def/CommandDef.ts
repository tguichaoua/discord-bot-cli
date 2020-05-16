import { SignatureDef } from "./SignatureDef";
import { CommandSet } from "../..";

export interface CommandDef<Context = any> {
    /** The description of this command. Used by help command. */
    description?: string;
    /** A list of different signatures for this command. */
    signatures?: SignatureDef<Context>[];
    /** Sub-commands of this command. */
    subs?: { [name: string]: CommandDef<Context> };

    /** Called once, when the command is initialised. */
    onInit?: (context: Context, commandSet: CommandSet<Context>) => void | Promise<void>;

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