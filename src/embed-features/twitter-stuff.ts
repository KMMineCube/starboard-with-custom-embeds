import { BaseMessageOptions, Message, User } from 'discord.js';
import { notEmpty } from '../utilities.js';
import { generic_custom_embed } from './custom-embeds.js';

async function composeTwitterEmbed(
    link: string,
    message: string,
    sender: User,
    pageNumber: number = 1
): Promise<BaseMessageOptions | undefined> {
    // replace twitter links with vxtwitter links
    const newContent = message.replace(
        new RegExp(/(?:mobile.)?twitter\.com/, 'g'),
        'vxtwitter.com'
    );

    return { content: newContent };
}

async function searchForTwitterLink(message: Message | string): Promise<string[]> {
    const content = message instanceof Message ? message.content : message;

    // search for link and get the link with the character preceding it, if it exists
    if (message instanceof Message && message.embeds.length > 0) {
        return [];
    }
    const userLinks =
        [
            ...content.matchAll(
                /(?<=\s|^)https:\/\/(?:mobile.)?twitter\.com(\/.+\/status\/\S+)/g
            )
        ].map((match) => match[0]) ?? new Array<string>();

    // check if the link is wrapped by <>

    userLinks.filter((link) => !(link.startsWith('<') && link.endsWith('>')));

    const pureTwitterLinks = userLinks
        .map((link) =>
            link.match(
                /(https:\/\/(?:mobile.)?twitter\.com\/[a-zA-Z0-9_]+\/status\/[0-9]+)/
            )
        )
        .filter(notEmpty)
        .map((link) => link[0]);

    if (!pureTwitterLinks) return [];
    return pureTwitterLinks;
}

export { searchForTwitterLink, composeTwitterEmbed };