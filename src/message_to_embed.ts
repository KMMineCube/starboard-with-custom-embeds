import { Collection, Message } from 'discord.js';
import { composeRedditEmbed, searchForRedditLink } from './reddit_stuff.js';
import { composeCustomEmbedCallback, searchForLinkCallback } from './utilities.js';

const searchAndEmbedCollection: {
    type: string;
    searchFunction: searchForLinkCallback;
    composeEmbedFunction: composeCustomEmbedCallback;
}[] = [
    {
        type: 'reddit',
        searchFunction: searchForRedditLink,
        composeEmbedFunction: composeRedditEmbed
    }
];

/**
 * Function to replace a user-sent message that contains a media link with a custom embed
 * @param message
 * @returns
 */
async function replaceLinkWithEmbed(message: Message): Promise<void> {
    if (message.member?.user.bot || message.member === null) return;
    const content = message.content;
    const channel = message.channel;

    const searchResults = await Promise.all(
        searchAndEmbedCollection.map(async (obj) => {
            const links = await obj.searchFunction(content);
            return { links, obj };
        })
    );

    const numLinks = searchResults.reduce((acc, val) => acc + val.links.length, 0);

    if (numLinks !== 1) return;

    // get the first link that is found
    const { links, obj } = searchResults.find((val) => val.links.length > 0) ?? {
        links: [],
        obj: undefined
    };

    if (links && links[0] && obj) {
        // delete original message
        await message.delete();
        // send reddit link to server
        await channel.send(
            await obj.composeEmbedFunction(links[0], content, message.member.user)
        );
    }
}

export { replaceLinkWithEmbed };
