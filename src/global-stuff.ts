import { Client, GatewayIntentBits, Collection } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { extendedClient } from './custom_classes/extended_client.js';
import { GuildStuff } from './custom_classes/server.js';

const baseClient: Client<true> = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ]
});

const client = new extendedClient(baseClient);

client.commands = new Collection();

const allServerData = new Collection<string, GuildStuff>();

const _filename = fileURLToPath(import.meta.url);

const _src_dirname = path.dirname(_filename);

export { client, allServerData, _src_dirname };