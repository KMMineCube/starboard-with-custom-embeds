import { Client, GatewayIntentBits, Collection } from "discord.js";
import { extendedClient } from "./custom_classes/extended_client";
import GuildStuff from "./custom_classes/server";

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

export { client, allServerData }