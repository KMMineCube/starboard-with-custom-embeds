import { Message } from 'discord.js';
import { composeRedditEmbed, searchForRedditLink } from './reddit_stuff.js';

/**
 * Function to replace a user-sent message that contains a media link with a custom embed
 * @param message
 * @returns
 */
async function replaceLinkWithEmbed(message: Message): Promise<void> {
    if (message.member?.user.bot || message.member === null) return;
    const content = message.content;
    const channel = message.channel;

    const redditLinks = await searchForRedditLink(content);

    const redditLink = redditLinks.length === 1 ? redditLinks[0] : null;

    if (redditLink) {
        // delete original message
        await message.delete();
        // send reddit link to server
        await channel.send(
            await composeRedditEmbed(redditLink, content, message.member?.user)
        );
    }
}

export { replaceLinkWithEmbed };
