import { Message, MessageEmbed } from 'discord.js';

import { Signature } from "./Signature";
import { Arg } from "./Arg";
import { CommandSet, ParseOption } from "./CommandSet";
import * as CommandResult from "./CommandResult";

export type ArgMap = Map<string, any>;
export type CommandInitCb = (context: any, commandSet: CommandSet) => void | Promise<void>;
export type CommandExecutorCb = (msg: Message, args: ArgMap, context: any, options: ParseOption, commandSet: CommandSet) => any | Promise<any>;

export class Command {

    private _name: string;
    private _description: string;
    private _parent: Command | undefined;
    private _deleteCommand = true;
    private _ignored = false;
    private _devOnly = false;
    private _isInitialized = false;
    private _onInit: CommandInitCb | undefined;
    private _signatures: Signature[] = [];
    private _subs: Map<string, Command> = new Map<string, Command>();

    constructor(name: string, description: string) {
        if (typeof name !== "string" || typeof description !== "string")
            throw new TypeError("Name and description must be string.");

        if (name === "")
            throw new TypeError("Name must be a non empty string.");

        this._name = name;
        this._description = description;
    }

    // === Getter =====================================================

    get name() { return this._name; }

    get description() { return this._description; }

    get deleteCommand() { return this._deleteCommand; }

    get ignored() { return this._ignored; }

    get isDevOnly() { return this._devOnly; }

    get isInitialized() { return this._isInitialized; }

    get parent() { return this._parent; }

    get signatures() { return [...this._signatures]; }

    get subs() { return Array.from(this._subs.values()); }

    get fullName() {
        const parents: Command[] = [];
        parents.unshift(this);

        let p: Command;
        do {
            p = parents[0];
            if (p.parent) parents.unshift(p.parent);
        } while (p.parent);

        return parents.map(cmd => cmd.name).join(" ");
    }

    getSubCommand(name: string) {
        return this._subs.get(name);
    }

    // === Settings Methods ===================

    /**
     * @categorie Settings
     */
    ignore() {
        this._ignored = true;
        return this;
    }

    /**
     * @categorie Settings
     */
    keepCommandMessage() {
        this._deleteCommand = false;
        return this;
    }

    /**
     * @categorie Settings
     */
    dev() {
        this._devOnly = true;
        return this;
    }

    /**
     * @categorie Settings
     */
    onInit(cb: CommandInitCb) {
        if (cb instanceof Function)
            this._onInit = cb;
        return this;
    }

    /**
     * @categorie Settings
     */
    signature(executor: CommandExecutorCb, ...args: Arg[]) {
        this._signatures.push(new Signature(executor, args));
        return this;
    }

    /**
     * @categorie Settings
     */
    sub(command: Command) {
        if (command instanceof Command && command._parent == undefined) {
            command._parent = this;
            this._subs.set(command._name, command);
        }
        return this;
    }

    // === * ==================================================

    async init(context: any, commandSet: CommandSet) {
        if (this.isInitialized)
            return;

        // init sub commands
        for (const s of this._subs.values()) {
            await s.init(context, commandSet);
        }

        // order signature to make sure the most suitable signature is called
        // signature with greater min argument needed count come firts
        // the adding order is preserved (signatures added first comes first)
        this._signatures = this._signatures
            .map((val, idx) => { return { val: val, idx: idx } })
            .sort((a, b) => {
                if (a.val.minArgNeeded > b.val.minArgNeeded) return -1;
                if (a.val.minArgNeeded < b.val.minArgNeeded) return 1;
                if (a.val.argCount > b.val.argCount) return -1;
                if (a.val.argCount < b.val.argCount) return 1;
                return a.idx - b.idx;
            })
            .map(o => o.val);
        if (this._onInit)
            await this._onInit(context, commandSet);
        this._isInitialized = true;
    }

    getEmbedHelp(prefix: string = "") {
        if (!prefix) prefix = "";

        const name = this.fullName;
        const description = this.description.length == 0 ? '---' : this.description;

        const embed = new MessageEmbed()
            .setTitle(prefix + name)
            .setDescription(description);


        // if there is only 1 signature without any argument, don't display this signature.
        if (!(this._signatures.length === 1 && this._signatures[0].argCount === 0))
            for (const s of this._signatures)
                embed.addField(prefix + name + ' ' + s.usageString, s.argDescription);

        if (this._subs.size != 0) {
            let str = '';
            for (const cmd of this._subs.values())
                str += `**${cmd.name}** ${cmd.description}\n`;
            embed.addField('Sub Commands', str);
        }

        return embed;
    }

    async execute(msg: Message, args: string[], context: any, options: ParseOption, commandSet: CommandSet) {
        if (!this._isInitialized)
            throw Error("You cannot use a non initialized command.");

        for (const s of this._signatures) {
            try {
                const parsedArgs = s.tryParse(args);
                if (parsedArgs) {
                    const result = await s.executor(msg, parsedArgs, context, options, commandSet);
                    return CommandResult.ok(this, s, result);
                }
            } catch (e) {
                return CommandResult.error(this, e);
            }
        }

        if (options.helpOnSignatureNotFound) {
            const embed = this.getEmbedHelp(options.prefix);
            await msg.author.send(`You make an error typing the following command\n\`${msg.content}\``, embed);
        }

        return CommandResult.signatureNotFound(this);
    }

}