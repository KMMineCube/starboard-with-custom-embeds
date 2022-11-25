import { Client, Collection, GatewayIntentBits } from 'discord.js';

import bot_creds from '../bot_creds.json' assert { type: 'json' };
import { handleButton } from './button_handler.js';
import { replaceLinkWithEmbed } from './message_to_embed.js';
import GuildStuff from './server.js';

const client: Client<true> = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ]
});

let allServerData = new Collection<string, GuildStuff>();

client.on('ready', () => {
    console.log('\nBot is ready!');

    client.guilds.cache.forEach((guild) => {
        allServerData.set(
            guild.id,
            new GuildStuff(guild, '⭐', 3, null, new Collection())
        );
    });
});

client
    .login(bot_creds.token)
    .then(() => {
        console.log(`Logged in as ${client.user.username}!`);
    })
    .catch((err: Error) => {
        console.error('Login Unsuccessful. Check credentials.');
        throw err;
    });

client.on('messageCreate', async (message) => {
    await replaceLinkWithEmbed(message);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        handleButton(interaction);
    }
});

client.on('joinGuild', (guild) => {
    allServerData.set(guild.id, new GuildStuff(guild, '⭐', 3, null, new Collection()));
});
