import { BaseMessageOptions, User } from 'discord.js';

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

type searchForLinkCallback = (link: string) => Promise<string[]>;

type composeCustomEmbedCallback = (
    link: string,
    message: string,
    sender: User,
    pageNumber?: number
) => Promise<BaseMessageOptions>;

export { notEmpty, searchForLinkCallback, composeCustomEmbedCallback };
