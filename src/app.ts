import { Client, GatewayIntentBits } from 'discord.js';

import bot_creds from '../bot_creds.json' assert { type: 'json' };
import { composeRedditEmbed } from './link_to_embed.js';

const client: Client<true> = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ]
});

client
    .login(bot_creds.token)
    .then(() => {
        console.log(`\nLogged in as ${client.user.username}!`);
    })
    .catch((err: Error) => {
        console.error('Login Unsuccessful. Check credentials.');
        throw err;
    });

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('messageCreate', async (message) => {
    if (message.member?.user.bot || message.member === null) return;
    const content = message.content;
    const channel = message.channel;
    // extract reddit link from message if it contains one
    const redditLink = content.match(
        /https:\/\/www.reddit.com\/r\/\w+\/comments\/\w+\/\w+\/\S+/
    );
    const pureRedditLink = redditLink?.[0].match(
        /https:\/\/www.reddit.com\/r\/\w+\/comments\/\w+\/\w+/
    )?.[0];
    if (pureRedditLink) {
        // send reddit link to server
        await message.delete();

        await channel.send(
            await composeRedditEmbed(pureRedditLink, content, message.member.user)
        );
        //add reaction to message
    }
});
