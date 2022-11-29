import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { extendedClient } from './custom_classes/extended_client.js';
import { GuildStuff } from './custom_classes/server.js';

import bot_creds from '../bot_creds.json' assert { type: 'json' };

const baseClient: Client<true> = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
        Partials.Channel
    ]
});

const client = new extendedClient(baseClient);

await client
    .login(bot_creds.token)
    .then(() => {
        console.log(`Logged in as ${client.user.username}!`);
    })
    .catch((err: Error) => {
        console.error('Login Unsuccessful. Check credentials.');
        throw err;
    });

client.commands = new Collection();

const allServerData = new Collection<string, GuildStuff>();

const _filename = fileURLToPath(import.meta.url);

const _src_dirname = path.dirname(_filename);

export { client, allServerData, _src_dirname };
