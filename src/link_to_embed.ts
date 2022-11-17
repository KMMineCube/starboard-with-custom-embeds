import { BaseMessageOptions, User } from 'discord.js';
import { generic_custom_embed } from './custom_embeds.js';

async function composeRedditEmbed(
    redditPostUrl: string,
    description: string,
    sender: User,
    pageNumber: number = 1
): Promise<BaseMessageOptions> {
    const asdf = (await fetch(redditPostUrl + '.json')) as Response;

    const json = (await asdf.json()) as Array<any>;

    const mediaData = json[0].data.children[0].data;

    // get number of images in post
    const numImages = mediaData.gallery_data?.items.length ?? 1;

    // get reddit post image
    let imageLink: string;

    if(pageNumber > numImages) {
        pageNumber = numImages;
    }

    if (numImages === 1) {
        imageLink = mediaData.url_overridden_by_dest;
    } else {
        // get the 'pageNumber'th image in the gallery
        imageLink =
            mediaData.media_metadata[mediaData.gallery_data?.items[pageNumber - 1].media_id].s.u ??
            mediaData.url_overridden_by_dest ??
            mediaData.url;
    }

    //replace &amp; with & in image link
    const imageLinkFixed = imageLink.replace(/&amp;/g, '&');
    //console.log(imageLinkFixed);

    // get reddit post title
    const embed = generic_custom_embed(
        'Reddit Post',
        description,
        redditPostUrl,
        imageLinkFixed,
        sender,
        0xff4500,
        numImages > 1,
        pageNumber,
        numImages
    );
    return embed;
}

export { composeRedditEmbed };
