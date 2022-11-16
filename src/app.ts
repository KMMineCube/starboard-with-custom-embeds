import { Client, GatewayIntentBits } from 'discord.js';

const client: Client<true> = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ]
});

import bot_creds from '../bot_creds.json' assert { type: 'json' };


await client.login(bot_creds.token)
.then(() => console.log(`\nLogged in as ${client.user.username}!`))
.catch((err: Error) => {
    console.error('Login Unsuccessful. Check credentials.');
    throw err;
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
