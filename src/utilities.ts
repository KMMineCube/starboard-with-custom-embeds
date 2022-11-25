import {
    BaseMessageOptions,
    ChatInputCommandInteraction,
    Embed,
    Message,
    SlashCommandBuilder,
    Snowflake,
    User
} from 'discord.js';
import {
    composeInstagramEmbed,
    searchForInstagramLink
} from './embed_features/instagram_stuff.js';
import {
    searchForRedditLink,
    composeRedditEmbed
} from './embed_features/reddit_stuff.js';
import {
    searchForTwitterLink,
    composeTwitterEmbed
} from './embed_features/twitter_stuff.js';

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

type commandData = {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

type ChannelId = Snowflake;

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
    },
    {
        type: 'instagram',
        searchFunction: searchForInstagramLink,
        composeEmbedFunction: composeInstagramEmbed
    }
];

/**
 * Returns the page number of the embed
 * @remark assumes the embed is a hootbot embed with the third field being the source link
 * @param embed
 * @returns [link, type]
 */
async function getLinkFromHootBotEmbed(embed: Embed): Promise<[string | null, string]> {
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

export {
    notEmpty,
    ChannelId,
    commandData,
    searchForLinkCallback,
    composeCustomEmbedCallback,
    searchAndEmbedCollection,
    getLinkFromHootBotEmbed,
    getPageNumbersFromHootBotEmbed
};
