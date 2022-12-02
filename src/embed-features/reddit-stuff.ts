import { BaseMessageOptions, Message, User } from 'discord.js';
import { notEmpty } from '../utilities.js';
import { generic_custom_embed } from './custom-embeds.js';
import fetch from 'node-fetch';

/**
 * Creates a custom embed for a reddit link
 * @param redditLink
 * @param description
 * @param sender
 * @param pageNumber
 * @returns
 */
async function composeRedditEmbed(
    redditLink: string,
    message: string,
    sender: User,
    pageNumber: number = 1
): Promise<BaseMessageOptions | undefined> {
    const response = await fetch(redditLink + '.json').catch(
        (err) => {
            console.log(err);
            return undefined;
        }
    );
    if (!response) return undefined;
    const jsonData = response as any;

    const jsonDataArray = (await jsonData.json()) as Array<any>;

    const mediaData = jsonDataArray[0].data.children[0].data;

    // replace any instance of `userLink` and non-whitespace trailing characters with text 'link'
    const newContent = message.replace(new RegExp(redditLink + '\\S*', 'g'), '*<link>*');

    // get number of images in post
    const numImages = mediaData.gallery_data?.items.length ?? 1;

    let is_video = mediaData.is_video ?? false;

    // get reddit post image
    let imageLink: string | null;

    if (pageNumber > numImages) {
        pageNumber = numImages;
    }

    // if reddit post is a video, get the video link
    if (is_video) {
        imageLink = null;
        // imageLink = mediaData.media.reddit_video.fallback_url;
    } else if (numImages === 1) {
        imageLink = mediaData.url_overridden_by_dest;
    } else if (numImages > 1) {
        // get the 'pageNumber'th image in the gallery
        imageLink =
            mediaData.media_metadata[
                mediaData.gallery_data?.items[pageNumber - 1].media_id
            ].s.u ??
            mediaData.url_overridden_by_dest ??
            mediaData.url;
    } else {
        imageLink = null;
    }

    // if reddit post has a gif
    if (mediaData.post_hint === 'rich:video') {
        imageLink = mediaData.media.oembed.thumbnail_url;
    }

    //replace &amp; with & in image link
    const imageLinkFixed = imageLink?.replace(/&amp;/g, '&') ?? null;

    // get reddit post title
    const embed = generic_custom_embed(
        'Reddit Post',
        newContent,
        redditLink,
        imageLinkFixed,
        sender,
        0xff4500,
        numImages > 1,
        pageNumber,
        numImages
    );
    if (imageLink === null) {
        return undefined;
    } else {
        return embed;
    }
}

async function searchForRedditLink(message: Message | string): Promise<string[]> {
    // search for link and get the link with the character preceding it, if it exists
    const content = message instanceof Message ? message.content : message;

    const userLinks = [
        ...content.matchAll(
            /(?<=\s|^)https?:\/\/(www\.)?reddit\.com\/r\/\w+\/comments\/\w+\/\w+[^\s]/g
        ),
        ...content.matchAll(/(?<=\s|^)https?:\/\/(www\.)?redd\.it\/\w+\/?/g)
    ].map((match) => match[0]);

    if (!userLinks) return [];
    //check if the link is wrapped by <>
    userLinks.filter((link) => !(link.startsWith('<') && link.endsWith('>')));
    const pureRedditLinks = userLinks
        .map((link) =>
            link.match(
                /(https:\/\/www\.reddit\.com\/r\/[a-zA-Z0-9]+\/comments\/[a-zA-Z0-9]+\/[a-zA-Z0-9_]+)/
            )
        )
        .filter(notEmpty)
        .map((link) => link[0]);

    return pureRedditLinks;
}

export { composeRedditEmbed, searchForRedditLink };
