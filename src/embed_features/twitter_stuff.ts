import { BaseMessageOptions, Message, User } from 'discord.js';
import { generic_custom_embed } from './custom_embeds.js';

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

    const embed = generic_custom_embed(
        'Twitter',
        newContent,
        link,
        null,
        sender,
        0x1da1f2,
        false
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
            ...content.matchAll(/https:\/\/(?:mobile.)?twitter\.com(\/.+\/status\/\S+)/g)
        ].map((match) => match[0]) ?? new Array<string>();
    if (!userLinks) return [];
    return userLinks;
}

export { searchForTwitterLink, composeTwitterEmbed };
