import { DMChannel, Message, PermissionString } from "discord.js";
import { AtLeastOne } from "../../utils/types";
import { Command } from "../Command";
import { CommandSetOptions } from "../CommandSetOptions";

export interface CommandGuardContext {
    readonly message: Message;
    readonly command: Command;
    readonly options: CommandSetOptions;
}

export type CommandGuardType<G extends CommandGuard> = G extends CommandGuard<infer T> ? T : never;

type CommandPreCondition = (c: CommandGuardContext) => boolean;

type CommandPreProcess<Values> = (c: CommandGuardContext) => Values;

type CommandPostProcess = (c: CommandGuardContext) => void;

export type CommandGuardTuple = readonly [boolean, string, CommandGuard];

export type CommandGuardDefinition = CommandGuard | CommandGuardTuple;

type GuardianCreation<Values> = AtLeastOne<{
    canRun: CommandPreCondition;
    after: CommandPostProcess;
    before: CommandPreProcess<Values>;
}>;

export class CommandGuard<Values = unknown> {
    private constructor(
        private readonly _canRun: CommandPreCondition | undefined,
        private readonly _before: CommandPreProcess<Values> | undefined,
        private readonly _after: CommandPostProcess | undefined,
    ) {}

    canRun(context: CommandGuardContext): boolean {
        return this._canRun ? this._canRun(context) : true;
    }

    before(context: CommandGuardContext): Values | undefined {
        return this._before ? this._before(context) : undefined;
    }

    after(context: CommandGuardContext): void {
        if (this._after) this._after(context);
    }

    set<B extends boolean>(inherited: B): readonly [B, never, this];
    set<K extends string>(key: K): readonly [false, K, this];
    set<B extends boolean, K extends string>(inherited: B, key: K): readonly [B, K, this];
    set<B extends boolean, K extends string>(key: K, inherited: B): readonly [B, K, this];
    set<B extends boolean, K extends string>(_1: B | K, _2?: B | K): readonly [B, K, this] {
        let b: boolean;
        let k: string | undefined;

        switch (typeof _1) {
            case "boolean":
                b = _1;
                k = _2 as string | undefined;
                break;
            case "string":
                k = _1;
                b = (_2 as boolean | undefined) ?? false;
        }

        return [b, k, this] as const as readonly [B, K, this];
    }

    static create<Values>(o: GuardianCreation<Values>): CommandGuard<Values> {
        return new CommandGuard(o.canRun, o.before, o.after);
    }
}

export const GUILD_ONLY_GUARD = CommandGuard.create({
    canRun: ctx => ctx.message.guild !== null,
    before: ctx => {
        return {
            guild: ctx.message.guild!,
            member: ctx.message.member!,
            channel: ctx.message.channel as Exclude<Message["channel"], DMChannel>,
        };
    },
});

export const OWNER_ONLY_GUARD = CommandGuard.create({
    canRun: ctx => ctx.options.devIDs.includes(ctx.message.author.id),
});

export function authorizationGuard(...permissions: PermissionString[]) {
    return CommandGuard.create({
        canRun: ({ message }) => {
            return message.member ? message.member.hasPermission(permissions) : true;
        },
    });
}

export const IS_ADMIN_GUARD = authorizationGuard("ADMINISTRATOR");
