import { BaseMessageOptions, User } from 'discord.js';
import { generic_custom_embed } from './custom_embeds.js';

/**
 * Creates a custom embed for a reddit link
 * @param redditLink
 * @param description
 * @param sender
 * @param pageNumber
 * @returns
 */
async function composeRedditEmbed(
    userLink: string,
    redditLink: string,
    message: string,
    sender: User,
    pageNumber: number = 1
): Promise<BaseMessageOptions> {
    const asdf = (await fetch(redditLink + '.json')) as Response;

    const json = (await asdf.json()) as Array<any>;

    const mediaData = json[0].data.children[0].data;

    // replace userLink and any trailing characters with '*<link to reddit post>*'
    const newContent = message.replace(new RegExp(`${userLink}[\S]*`), `*<link to reddit post>*`);
    // console.log(newContent);

    // get number of images in post
    const numImages = mediaData.gallery_data?.items.length ?? 1;

    // get reddit post image
    let imageLink: string;

    if (pageNumber > numImages) {
        pageNumber = numImages;
    }

    if (numImages === 1) {
        imageLink = mediaData.url_overridden_by_dest;
    } else {
        // get the 'pageNumber'th image in the gallery
        imageLink =
            mediaData.media_metadata[
                mediaData.gallery_data?.items[pageNumber - 1].media_id
            ].s.u ??
            mediaData.url_overridden_by_dest ??
            mediaData.url;
    }

    // if reddit post is a video, get the video link
    if (mediaData.is_video) {
        imageLink = mediaData.media.reddit_video.fallback_url;
    }
    // if reddit post has a gif
    if (mediaData.post_hint === 'rich:video') {
        imageLink = mediaData.media.oembed.thumbnail_url;
    }

    //replace &amp; with & in image link
    const imageLinkFixed = imageLink.replace(/&amp;/g, '&');
    // console.log(imageLinkFixed);

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
    return embed;
}

async function searchForRedditLink(
    content: string
): Promise<[string | undefined, string | undefined]> {
    const userLink =
        content.match(
            /(https:\/\/www\.reddit\.com\/r\/[a-zA-Z0-9]+\/comments\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[^\s]*)/
        ) ??
        content.match(
            /(https:\/\/www\.reddit\.com\/r\/[a-zA-Z0-9]+\/comments\/[a-zA-Z0-9]+\/[a-zA-Z0-9_]+)/
        ) ??
        content.match(/(https:\/\/redd\.it\/[a-zA-Z0-9]+)/);
    if(!userLink) return [undefined, undefined];
    //check if the link is wrapped by <>
    const wrappedLink = content.match(
        new RegExp(`<${userLink}>`)
    );
    if (wrappedLink) {
        // console.log('wrapped link');
        return [undefined, undefined];
    }

    const pureRedditLink = userLink[0].match(/(https:\/\/www\.reddit\.com\/r\/[a-zA-Z0-9]+\/comments\/[a-zA-Z0-9]+\/[a-zA-Z0-9_]+)/);
    // console.log('user link: ' + userLink[0] + '\nactual link:' + pureRedditLink?.[0]);
    return [userLink[0], pureRedditLink?.[0]];
}

export { composeRedditEmbed, searchForRedditLink };
