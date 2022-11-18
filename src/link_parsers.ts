import { Embed } from 'discord.js';
import { searchForRedditLink } from './reddit_stuff.js';

/**
 * Returns the page number of the embed
 * @remark assumes the embed is a hootbot embed with the third field being the source link
 * @param embed
 * @returns [link, type]
 */
function getLinkFromHootBotEmbed(embed: Embed): [string | null, string] {
    const link = embed?.fields[2]?.value.split('](')[1]?.slice(0, -1) ?? null;
    if (link === null) return [null, ''];
    let type = 'unknown';
    if (searchForRedditLink(link) !== undefined) type = 'reddit';
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
    let [currentPage, maxPage] = embed?.fields[1]?.value
        .split('/')
        .map((str) => Number(str)) ?? [1, 1];
    if (!currentPage) currentPage = 1;
    if (!maxPage) maxPage = 1;
    return [currentPage, maxPage];
}

export { getLinkFromHootBotEmbed, getPageNumbersFromHootBotEmbed };
