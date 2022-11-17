import { Client, GatewayIntentBits, GuildMember, PermissionsBitField } from 'discord.js';

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

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'delete') {
            if (
                interaction.message.embeds[0]?.fields[0]?.value ===
                    interaction.user.toString() ||
                (interaction.member as GuildMember)?.permissions.has(
                    PermissionsBitField.Flags.ManageMessages
                )
            ) {
                await interaction.message.delete();
            } else {
                await interaction.reply({
                    content: 'You cannot delete this message.',
                    ephemeral: true
                });
            }
        } else if (interaction.customId === 'next_page') {
            const embed = interaction.message.embeds[0];
            // field is in the format "1/5"
            let [currentPage, maxPage] = embed?.fields[1]?.value.split('/').map(str => Number(str)) ?? [1,1];
            const link = embed?.fields[2]?.value.split('](')[1]?.slice(0, -1) ?? '';
            console.log('link: ', link);
            if (!currentPage) currentPage = 1;
            if (!maxPage) maxPage = 1;  
            if (currentPage < maxPage) {
                const newEmbed = await composeRedditEmbed(
                    link,
                    embed?.description ?? '',
                    interaction.user,
                    currentPage + 1
                );
                await interaction.update(newEmbed);
            } else {
                await interaction.reply({
                    content: 'This is the last page.',
                    ephemeral: true
                });
            }
        } else if (interaction.customId === 'prev_page') {
            const embed = interaction.message.embeds[0];
            // field is in the format "1/5"
            let [currentPage, maxPage] = embed?.fields[1]?.value.split('/').map(str => Number(str)) ?? [1,1];
            // link is in the format [Click here](url)
            const link = embed?.fields[2]?.value.split('](')[1]?.slice(0, -1) ?? '';
            if (!currentPage) currentPage = 1;
            if (!maxPage) maxPage = 1;  
            if (currentPage > 1) {
                const newEmbed = await composeRedditEmbed(
                    link,
                    embed?.description ?? '',
                    interaction.user,
                    currentPage - 1
                );
                await interaction.update(newEmbed);
            } else {
                await interaction.reply({
                    content: 'This is the first page.',
                    ephemeral: true
                });
            }
        }
    }
});
