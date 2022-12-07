import { BaseMessageOptions, Message, User } from 'discord.js';
import { notEmpty } from '../utilities.js';
import { genericCustomEmbed } from './custom-embeds.js';

async function composeTwitterEmbed(
    twitterLink: string,
    message: string,
    sender: User
): Promise<BaseMessageOptions | undefined> {
    // replace twitter links with <link>
    const newContent = message.replace(new RegExp(twitterLink + '\\S*', 'g'), '*<link>*');

    const fixedLink = twitterLink.replace('twitter', 'fxtwitter');

    const embed = genericCustomEmbed(
        'Twitter',
        newContent,
        fixedLink,
        null,
        sender,
        0x1da1f2,
        false
    );

    return { content: fixedLink, embeds: embed.embeds };
}

async function searchForTwitterLink(message: Message | string): Promise<string[]> {
    const content = message instanceof Message ? message.content : message;

    // search for link and get the link with the character preceding it, if it exists
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

    // force wait 3 seconds before checking if message has embeds
    await new Promise((resolve) => setTimeout(resolve, 3000));
    if (message instanceof Message && message.embeds.length > 0) {
        return [];
    }

    return pureTwitterLinks;
}

export { searchForTwitterLink, composeTwitterEmbed };
