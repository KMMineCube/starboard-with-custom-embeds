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

    const [userLink, redditLink] = await searchForRedditLink(content);

    if (redditLink && userLink) {
        // delete original message
        await message.delete();
        // send reddit link to server
        await channel.send(
            await composeRedditEmbed(userLink, redditLink, content, message.member?.user)
        );
    }
}

export { replaceLinkWithEmbed };
