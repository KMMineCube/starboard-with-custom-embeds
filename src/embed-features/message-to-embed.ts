import { Message } from 'discord.js';
import { searchAndEmbedCollection } from './embed-utils.js';

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
            const links = await obj.searchFunction(message);
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
        const newEmbed = await obj.composeEmbedFunction(
            links[0],
            content,
            message.member.user
        );
        if (newEmbed) {
            // delete original message
            const asdf = await message.delete().catch(
                (err) => {
                    console.log(`Error deleting message: ${err}`)
                    return undefined;
                }
            );
            if (!asdf) return;
            // send reddit link to server
            await channel.send(newEmbed);
        }
    }
}

export { replaceLinkWithEmbed };
