import { Message, User, BaseMessageOptions, Embed, Snowflake } from 'discord.js';
import { searchForInstagramLink, composeInstagramEmbed } from './instagram-stuff.js';
import { composePixivEmbed, searchForPixivLink } from './pixiv-stuff.js';
import { searchForRedditLink, composeRedditEmbed } from './reddit-stuff.js';
import { searchForTwitterLink, composeTwitterEmbed } from './twitter-stuff.js';

type searchForLinkCallback = (link: Message | string) => Promise<string[]>;

type composeCustomEmbedCallback = (
    link: string,
    message: string,
    sender: User,
    pageNumber?: number
) => Promise<BaseMessageOptions | undefined>;

const searchAndEmbedCollection: {
    type: string;
    linkFix: boolean;
    searchFunction: searchForLinkCallback;
    composeEmbedFunction: composeCustomEmbedCallback;
}[] = [
    {
        type: 'reddit',
        linkFix: false,
        searchFunction: searchForRedditLink,
        composeEmbedFunction: composeRedditEmbed
    },
    {
        type: 'twitter',
        linkFix: true,
        searchFunction: searchForTwitterLink,
        composeEmbedFunction: composeTwitterEmbed
    },
    // ! removing instagram until fix is found
    // {
    //     type: 'instagram',
    //     linkFix: false,
    //     searchFunction: searchForInstagramLink,
    //     composeEmbedFunction: composeInstagramEmbed
    // },
    {
        type: 'pixiv',
        linkFix: true,
        searchFunction: searchForPixivLink,
        composeEmbedFunction: composePixivEmbed
    }
];

/**
 * Returns the page number of the embed
 * @remark assumes the embed is a hootbot embed with the third field being the source link
 * @param embed
 * @returns [link, type]
 */
async function getSourceLinkFromHootBotEmbed(
    embed: Embed
): Promise<[string | null, string]> {
    const link =
        embed?.fields
            .find((field) => field.name === 'Source')
            ?.value.split('](')[1]
            ?.slice(0, -1) ?? null;

    if (link === null) return [null, ''];
    //search through the searchAndEmbedCollection to find the type of link using the search function
    let _type = '';
    // find function refuses to work for some stupid reason
    for (const { type, searchFunction } of searchAndEmbedCollection) {
        const links = await searchFunction(link);
        if (links.length > 0) {
            _type = type;
            break;
        }
    }
    return [link, _type];
}

/**
 * Returns the page number of the embed
 * @remark assumes the embed is a hootbot embed with the second field being the page number
 * @param embed
 * @returns
 */
async function getPageNumbersFromHootBotEmbed(embed: Embed): Promise<[number, number]> {
    // field is in the format "1/5"
    let [currentPage, maxPage] = embed?.fields
        .find((field) => field.name === 'Page')
        ?.value.split('/')
        .map((str) => Number(str)) ?? [1, 1];
    if (!currentPage) currentPage = 1;
    if (!maxPage) maxPage = 1;
    return [currentPage, maxPage];
}

function getSenderIdFromHootBotEmbed(embed: Embed): Snowflake | null {
    const sender = embed?.fields.find((field) => field.name === 'Sender')?.value;
    if (!sender) return null;
    const senderId = sender.match(/<@!?(?<id>\d+)>/)?.groups?.id;
    if (!senderId) return null;
    return senderId;
}

export {
    searchForLinkCallback,
    composeCustomEmbedCallback,
    searchAndEmbedCollection,
    getSourceLinkFromHootBotEmbed,
    getPageNumbersFromHootBotEmbed,
    getSenderIdFromHootBotEmbed
};
