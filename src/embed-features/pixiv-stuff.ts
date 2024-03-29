import { BaseMessageOptions, Message, User } from 'discord.js';
import { notEmpty } from '../utilities.js';
import { genericCustomEmbed } from './custom-embeds.js';

async function composePixivEmbed(
    pixivLink: string,
    message: string,
    sender: User,
    pageNumber: number = 1
): Promise<BaseMessageOptions | undefined> {
    // replace pixiv links with fxpixiv links
    //const newContent = message.replace(new RegExp(pixivLink + '\\S*', 'g'), '*<link>*');

    const fixedLink = pixivLink.replace('pixiv', 'fxpixiv');

    const embed = genericCustomEmbed('Pixiv', message, fixedLink, null, sender, 0x0096fa);

    return { content: fixedLink, embeds: embed.embeds };
}

async function searchForPixivLink(message: Message | string): Promise<string[]> {
    const content = message instanceof Message ? message.content : message;

    // force wait 3 seconds before checking if message has embeds
    // search for link and get the link with the character preceding it, if it exists
    const userLinks =
        [...content.matchAll(/https:\/\/www.pixiv\.net(\/.+\/artworks\/\S+)/g)].map(
            (match) => match[0]
        ) ?? new Array<string>();

    if (!userLinks) return [];
    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (message instanceof Message && message.embeds.length > 0) {
        return [];
    }
    return userLinks;
}

export { searchForPixivLink, composePixivEmbed };
