import { BaseMessageOptions, Message, User } from 'discord.js';
import { generic_custom_embed } from './custom_embeds.js';
import { notEmpty } from './utilities.js';

async function composeInstagramEmbed(
    instagramLink: string,
    message: string,
    sender: User,
    pageNumber: number = 1
): Promise<BaseMessageOptions | undefined> {
    //get data from instagram link
    const jsonData = await (await fetch(instagramLink + '?__a=1&__d=dis')).json();
    if (!jsonData.graphql) return undefined;
    // console.log(jsonData);
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

    const embed = generic_custom_embed(
        'Instagram',
        newContent,
        instagramLink,
        mediaLink,
        sender,
        0xe4405f,
        numImages > 1,
        pageNumber,
        numImages
    );

    return embed;
}

async function searchForInstagramLink(message: Message | string): Promise<string[]> {
    const content = message instanceof Message ? message.content : message;

    const userLinks = [
        ...content.matchAll(/https:\/\/www\.instagram\.com\/p\/[a-zA-Z0-9_-]+\/?/g),
        ...content.matchAll(/https:\/\/instagram\.com\/p\/[a-zA-Z0-9_-]+\/\w+[^\s]/g),
        ...content.matchAll(/https:\/\/instagr\.am\/p\/[a-zA-Z0-9_-]+\/?/g)
    ].map((match) => match[0]);

    if (!userLinks) return [];

    //check if the link is wrapped by <>
    userLinks.filter((link) => !(link.startsWith('<') && link.endsWith('>')));

    const pureInstagramLinks = userLinks
        .map((link) =>
            link.match(/(https:\/\/www\.instagram\.com\/p\/[a-zA-Z0-9_-]+\/?)/)
        )
        .filter(notEmpty)
        .map((link) => link[0]);

    return pureInstagramLinks;
}

export { composeInstagramEmbed, searchForInstagramLink };