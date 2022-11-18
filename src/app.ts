import { Client, GatewayIntentBits } from 'discord.js';

import bot_creds from '../bot_creds.json' assert { type: 'json' };
import { handleButton } from './button_handler.js';
import { replaceLinkWithEmbed } from './message_to_embed.js';

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
    await replaceLinkWithEmbed(message);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        handleButton(interaction);
    }
});
