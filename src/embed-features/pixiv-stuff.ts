import { BaseMessageOptions, Message, User } from 'discord.js';
import { notEmpty } from '../utilities.js';
import { generic_custom_embed } from './custom-embeds.js';

async function composePixivEmbed(
    link: string,
    message: string,
    sender: User,
    pageNumber: number = 1
): Promise<BaseMessageOptions | undefined> {
    // replace pixiv links with fxpixiv links
    const newContent = message.replace(
        new RegExp(/(?:mobile.)?pixiv\.com/, 'g'),
        'fxpixiv.com'
    );

    return { content: newContent };
}

async function searchForPixivLink(message: Message | string): Promise<string[]> {
    const content = message instanceof Message ? message.content : message;

    // search for link and get the link with the character preceding it, if it exists
    if (message instanceof Message && message.embeds.length > 0) {
        return [];
    }
    const userLinks =
        [
            ...content.matchAll(/https:\/\/(?:mobile.)?pixiv\.com(\/.+\/artworks\/\S+)/g)
        ].map((match) => match[0]) ?? new Array<string>();

    // remove mobile. from the link
    const purePixivLinks = userLinks
        .map((link) =>
            link.match(
                /(https:\/\/(?:mobile.)?pixiv\.com\/[a-zA-Z0-9_]+\/artworks\/[0-9]+)/
            )
        )
        .filter(notEmpty)
        .map((link) => link[0]);

    if (!userLinks) return [];
    return userLinks;
}

export { searchForPixivLink, composePixivEmbed as composeTwitterEmbed };
