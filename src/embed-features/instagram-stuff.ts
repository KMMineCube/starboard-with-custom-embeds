import { BaseMessageOptions, Message, User } from 'discord.js';
import { genericCustomEmbed } from './custom-embeds.js';
import { notEmpty } from '../utilities.js';
import fetch from 'node-fetch';

async function composeInstagramEmbed(
    instagramLink: string,
    message: string,
    sender: User,
    pageNumber: number = 1
): Promise<BaseMessageOptions | undefined> {
    //get data from instagram link
    const response = await fetch(instagramLink + '?__a=1&__d=dis').catch((err) => {
        console.log(err);
        return undefined;
    });
    if (!response) return undefined;
    const jsonData = (await response.json()) as any;
    if (!jsonData.graphql) return undefined;
    const jsonDataArray = jsonData.graphql.shortcode_media;
    const media = jsonDataArray.edge_sidecar_to_children?.edges;
    // get number of images in post
    const numImages = media?.length ?? 1;

    let mediaLink: string;
    if (numImages > 1) {
        mediaLink = media ? media[pageNumber - 1].node.display_url : null;
    } else {
        mediaLink = jsonDataArray.display_url;
    }
    if (!mediaLink) return;

    // replace any instance of `userLink` and non-whitespace trailing characters with text 'link'
    const newContent = message.replace(
        new RegExp(instagramLink + '\\S*', 'g'),
        '*<link>*'
    );

    const description = (
        newContent +
        '\n\n' +
        '\n__**Post Caption**__: ' +
        jsonDataArray.edge_media_to_caption.edges[0].node.text
    ).slice(0, 2048); // description limit is 2048 characters

    const postInfo =
        `**${jsonDataArray.edge_media_preview_like.count}** 👍 ` +
        `${jsonDataArray.edge_media_to_comment.count} 💬 `;

    const embed = genericCustomEmbed(
        jsonDataArray.owner.username +
            ' at ' +
            new Date(jsonDataArray.taken_at_timestamp * 1000).toLocaleString('en-UTC'),
        description,
        instagramLink,
        mediaLink,
        sender,
        0xe4405f,
        numImages > 1,
        pageNumber,
        numImages,
        postInfo
    );

    return embed;
}

async function searchForInstagramLink(message: Message | string): Promise<string[]> {
    const content = message instanceof Message ? message.content : message;

    const userLinks = [
        ...content.matchAll(
            /(?<=\s|^)https:\/\/www\.instagram\.com\/p\/[a-zA-Z0-9_-]+\/?/g
        ),
        ...content.matchAll(
            /(?<=\s|^)https:\/\/instagram\.com\/p\/[a-zA-Z0-9_-]+\/\w+[^\s]/g
        ),
        ...content.matchAll(/(?<=\s|^)https:\/\/instagr\.am\/p\/[a-zA-Z0-9_-]+\/?/g)
    ].map((match) => match[0]);

    if (!userLinks) return [];

    //check if the link is wrapped by <>
    userLinks.filter((link) => !(link.startsWith('<') && link.endsWith('>')));

    // convert all links to the format https://www.instagram.com/p/shortcode/
    const pureInstagramLinks = userLinks
        .map((link) => {
            // get the shortcode from the link
            const shortcode = link.match(/\/p\/([a-zA-Z0-9_-]+)\/?/);
            if (!shortcode) return null;
            return 'https://www.instagram.com/p/' + shortcode[1] + '/';
        })
        .filter(notEmpty);

    return pureInstagramLinks;
}

export { composeInstagramEmbed, searchForInstagramLink };
