import { BaseMessageOptions, User } from 'discord.js';
import { generic_custom_embed } from './custom_embeds.js';

async function composeRedditEmbed(
    redditPostUrl: string,
    description: string,
    sender: User
): Promise<BaseMessageOptions> {
    const asdf = (await fetch(redditPostUrl + '.json')) as Response;

    const json = (await asdf.json()) as Array<any>;

    const mediaData = json[0].data.children[0].data;

    // get number of images in post
    const numImages = mediaData.gallery_data?.items.length ?? 1;

    // get reddit post image
    let imageLink: string;

    if (numImages === 1) {
        imageLink = mediaData.url_overridden_by_dest;
    } else {
        imageLink =
            mediaData.media_metadata[mediaData.gallery_data?.items[0].media_id].s.u ??
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
        imageLinkFixed,
        sender,
        0xff4500,
        numImages > 1,
        1,
        numImages
    );
    return embed;
}

export { composeRedditEmbed };
