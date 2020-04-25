import { Message, MessageEmbed } from 'discord.js';

import Signature from "./Signature";
import CommandSet from "./CommandSet";
import * as CommandResult from "./CommandResult";
import Prop from "./Prop";

import { keyOf } from "../com";
import { ParseOptions } from './ParseOptions';
import { CommandDef } from './def/CommandDef';
import { FlagInfos, FlagInfo } from './FlagInfo';

export default class Command {

    private _name: string;
    private _description: string;
    private _parent: Command | null = null;

    private _onInit?: (context: any, commandSet: CommandSet) => void | Promise<void>;
    private _signatures: Signature[] = [];
    private _subs: Map<string, Command> = new Map<string, Command>();

    private _inherit = false;
    private _isInitialized = false;

    private _settings = {
        deleteCommand: new Prop(true),
        ignored: new Prop(false),
        devOnly: new Prop(false),
    }

    constructor(name: string, def: CommandDef) {
        if (typeof name !== "string" || name === "")
            throw new TypeError("Command name must be a non-empty string");

        this._name = name;
        this._description = def.description ?? "";

        this._onInit = def.onInit;

        this._signatures = def.signatures ? def.signatures.map(d => new Signature(d)) : [];

        if (def.subs)
            for (const k of Object.keys(def.subs))
                this._subs.set(k, new Command(k, def.subs[k]));

        this._inherit = !!def.inherit;

        this._settings.deleteCommand.rawValue = def.deleteCommandMessage;
        this._settings.ignored.rawValue = def.ignore;
        this._settings.devOnly.rawValue = def.dev;
    }

    // === Getter =====================================================

    get name() { return this._name; }

    get description() { return this._description; }

    get deleteCommand() { return this._settings.deleteCommand.value; }

    get ignored() { return this._settings.ignored.value; }

    get isDevOnly() { return this._settings.devOnly.value; }

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

    // === * ==================================================

    async init(context: any, commandSet: CommandSet) {
        if (this.isInitialized)
            return;

        // inherit from parent
        if (this._parent && this._inherit) {
            for (const k of keyOf(this._settings)) {
                this._settings[k].inherit(this._parent._settings[k]);
            }
        }

        // init sub commands
        for (const s of this._subs.values()) {
            await s.init(context, commandSet);
        }

        // order signature to make sure the most suitable signature is called
        // signature with greater count of arguments come firts
        // the adding order is preserved (signatures added first comes first)
        this._signatures = this._signatures
            .map((val, idx) => { return { val: val, idx: idx } })
            .sort((a, b) => {
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

    async execute(message: Message, args: string[], context: any, options: ParseOptions, commandSet: CommandSet) {
        if (!this._isInitialized)
            throw Error("You cannot use a non initialized command.");

        const flagInfos: FlagInfo[] = [];

        for (let i = 0; i < args.length; i++) {
            let inFlag = args[i];

            if (inFlag.match(/^--[^-].+$/)) {
                const part = inFlag.substring(2).split(/=(.+)/);
                let value = part.length > 1 ? part[1] : undefined;
                flagInfos.push({ type: "full", name: part[0], value });
            } else if (inFlag.match(/^-[a-zA-Z]$/)) {
                flagInfos.push({
                    type: "shortcut",
                    name: inFlag.substring(1),
                    valueIndex: i + 1 === args.length ? undefined : i
                });
            } else if (inFlag.match(/^-[a-zA-Z]{2,}$/)) {
                const flagNames = inFlag.substring(1).split("");

                for (const flagName of flagNames) {
                    flagInfos.push({
                        type: "shortcut",
                        name: flagName,
                    });
                }
            } else
                continue;

            args.splice(i, 1); // remove the flag from args
            i--; // make sure to not skip an argument.
        }


        for (const s of this._signatures) {
            try {
                const parsedData = s.tryParse(args, flagInfos);
                if (parsedData) {
                    const result = await s.executor(
                        {
                            message,
                            args: parsedData.parsedArgs,
                            flags: parsedData.parsedFlags,
                            rest: parsedData.rest,
                            context,
                            options,
                            commandSet
                        }
                    );
                    return CommandResult.ok(this, s, result);
                }
            } catch (e) {
                return CommandResult.error(e);
            }
        }

        if (options.helpOnSignatureNotFound) {
            const embed = this.getEmbedHelp(options.prefix);
            await message.author.send(`You make an error typing the following command\n\`${message.content}\``, embed);
        }

        return CommandResult.signatureNotFound(this);
    }
}