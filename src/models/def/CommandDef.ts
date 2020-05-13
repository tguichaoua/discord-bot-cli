import { SignatureDef } from "./SignatureDef";
import { CommandSet } from "../..";

export interface CommandDef {
    /** The description of this command. Used by help command. */
    description?: string;
    /** A list of different signatures for this command. */
    signatures?: SignatureDef[];
    /** Sub-commands of this command. */
    subs?: { [name: string]: CommandDef };

    /** Called once, when the command is initialised. */
    onInit?: (context: any, commandSet: CommandSet) => void | Promise<void>;

    /** If set to true, undefined inheritable properties are inherited from parent command. (default is false). */
    inherit?: boolean;
    /** If set to true, this command is not loaded. (default is false). [inheritable] */
    ignore?: boolean;
    /** If set to true, the message that trigger this command is automatically deleted. (default is true). [inheritable] */
    deleteCommandMessage?: boolean;
    /** If set to true, only user registred as dev via `ParseCommand.devIDs` can execute, get help or list this command. (default is false). [inheritable] */
    dev?: boolean;
}