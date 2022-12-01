import { Client, GatewayIntentBits, Collection, Partials, Snowflake } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { extendedClient } from './custom-classes/extended-client.js';
import { GuildStuff } from './custom-classes/server.js';

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

client.commands = new Collection();

const allServerData = new Collection<string, GuildStuff>();

const starboardMessages = new Collection<string, Snowflake[]>();

const _filename = fileURLToPath(import.meta.url);

const _src_dirname = path.dirname(_filename);

export { client, allServerData, _src_dirname, starboardMessages };
