import { BaseMessageOptions, Embed, Message, User } from 'discord.js';
import { searchForRedditLink, composeRedditEmbed } from './reddit_stuff.js';
import { searchForTwitterLink, composeTwitterEmbed } from './twitter_stuff.js';

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

type searchForLinkCallback = (link: Message | string) => Promise<string[]>;

type composeCustomEmbedCallback = (
    link: string,
    message: string,
    sender: User,
    pageNumber?: number
) => Promise<BaseMessageOptions | undefined>;

const searchAndEmbedCollection: {
    type: string;
    searchFunction: searchForLinkCallback;
    composeEmbedFunction: composeCustomEmbedCallback;
}[] = [
    {
        type: 'reddit',
        searchFunction: searchForRedditLink,
        composeEmbedFunction: composeRedditEmbed
    },
    {
        type: 'twitter',
        searchFunction: searchForTwitterLink,
        composeEmbedFunction: composeTwitterEmbed
    }
];

/**
 * Returns the page number of the embed
 * @remark assumes the embed is a hootbot embed with the third field being the source link
 * @param embed
 * @returns [link, type]
 */
function getLinkFromHootBotEmbed(embed: Embed): [string | null, string] {
    const link =
        embed?.fields
            .find((field) => field.name === 'Source')
            ?.value.split('](')[1]
            ?.slice(0, -1) ?? null;
    if (link === null) return [null, ''];
    //search through the searchAndEmbedCollection to find the type of link
    const type =
        searchAndEmbedCollection.find(
            async (obj) => (await obj.searchFunction(link)).length > 0
        )?.type ?? '';
    return [link, type];
}

/**
 * Returns the page number of the embed
 * @remark assumes the embed is a hootbot embed with the second field being the page number
 * @param embed
 * @returns
 */
function getPageNumbersFromHootBotEmbed(embed: Embed): [number, number] {
    // field is in the format "1/5"
    let [currentPage, maxPage] = embed?.fields
        .find((field) => field.name === 'Page')
        ?.value.split('/')
        .map((str) => Number(str)) ?? [1, 1];
    if (!currentPage) currentPage = 1;
    if (!maxPage) maxPage = 1;
    return [currentPage, maxPage];
}

export {
    notEmpty,
    searchForLinkCallback,
    composeCustomEmbedCallback,
    searchAndEmbedCollection,
    getLinkFromHootBotEmbed,
    getPageNumbersFromHootBotEmbed
};
