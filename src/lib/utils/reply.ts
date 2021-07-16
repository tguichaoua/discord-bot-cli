import { Message, MessageOptions, MessageAdditions, APIMessage, StringResolvable, SplitOptions } from "discord.js";

/** @internal */
export async function reply(
    message: Message,
    options: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions | APIMessage,
): Promise<Message>;
/** @internal */
export async function reply(
    message: Message,
    options:
        | (MessageOptions & {
              split: true | SplitOptions;
              content: StringResolvable;
          })
        | APIMessage,
): Promise<Message[]>;
/** @internal */
export async function reply(
    message: Message,
    content: StringResolvable,
    options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions,
): Promise<Message>;
/** @internal */
export async function reply(
    message: Message,
    content: StringResolvable,
    options?: MessageOptions & { split: true | SplitOptions },
): Promise<Message[]>;
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function reply(message: Message, a: any, b?: any): Promise<Message | Message[]> {
    try {
        return await message.channel.send(a, b);
    } catch {
        return await message.author.send(a, b);
    }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
