import {
    BaseMessageOptions,
    ChatInputCommandInteraction,
    Client,
    Collection,
    Embed,
    Message,
    SlashCommandBuilder,
    Snowflake,
    User
} from 'discord.js';
import { composeInstagramEmbed, searchForInstagramLink } from './instagram_stuff.js';
import { searchForRedditLink, composeRedditEmbed } from './reddit_stuff.js';
import { searchForTwitterLink, composeTwitterEmbed } from './twitter_stuff.js';

import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

type commandData = {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

class extendedClient extends Client<true> {
    public commands: Collection<string, commandData>;
    public constructor(client: Client) {
        super(client.options);
        this.commands = new Collection();
    }
    public async deployCommands() {
        const commands = [];
        const __filename = fileURLToPath(import.meta.url);

        const __dirname = path.dirname(__filename);

        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = (await import(filePath)).default as commandData;
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if (command !== undefined && command !== null) {
                this.commands.set(command.data.name, command);
            } else {
                console.log(
                    `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                );
            }
            commands.push(command.data.toJSON());
        }

        // Construct and prepare an instance of the REST module
        const rest = new REST({ version: '10' }).setToken(this.token);

        // and deploy your commands!
        (async () => {
            try {
                console.log(
                    `Started refreshing ${commands.length} application (/) commands.`
                );

                // The put method is used to fully refresh all commands in the guild with the current set
                await rest.put(Routes.applicationCommands(this.user.id), {
                    body: commands
                });

                console.log(`Successfully reloaded application (/) commands.`);
            } catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error);
            }
        })();
    }
}

type ChannelId = Snowflake;

type searchForLinkCallback = (link: Message | string) => Promise<string[]>;

type composeCustomEmbedCallback = (
    link: string,
    message: string,
    sender: User,
    pageNumber?: number
) => Promise<BaseMessageOptions | undefined>;

const searchAndEmbedCollection: {
    type: string;
    searchFunction: searchForLinkCallback;
    composeEmbedFunction: composeCustomEmbedCallback;
}[] = [
    {
        type: 'reddit',
        searchFunction: searchForRedditLink,
        composeEmbedFunction: composeRedditEmbed
    },
    {
        type: 'twitter',
        searchFunction: searchForTwitterLink,
        composeEmbedFunction: composeTwitterEmbed
    },
    {
        type: 'instagram',
        searchFunction: searchForInstagramLink,
        composeEmbedFunction: composeInstagramEmbed
    }
];

/**
 * Returns the page number of the embed
 * @remark assumes the embed is a hootbot embed with the third field being the source link
 * @param embed
 * @returns [link, type]
 */
async function getLinkFromHootBotEmbed(embed: Embed): Promise<[string | null, string]> {
    const link =
        embed?.fields
            .find((field) => field.name === 'Source')
            ?.value.split('](')[1]
            ?.slice(0, -1) ?? null;

    if (link === null) return [null, ''];
    //search through the searchAndEmbedCollection to find the type of link using the search function
    let _type = '';
    // find function refuses to work for some stupid reason
    for (const { type, searchFunction } of searchAndEmbedCollection) {
        const links = await searchFunction(link);
        if (links.length > 0) {
            _type = type;
            break;
        }
    }
    return [link, _type];
}

/**
 * Returns the page number of the embed
 * @remark assumes the embed is a hootbot embed with the second field being the page number
 * @param embed
 * @returns
 */
async function getPageNumbersFromHootBotEmbed(embed: Embed): Promise<[number, number]> {
    // field is in the format "1/5"
    let [currentPage, maxPage] = embed?.fields
        .find((field) => field.name === 'Page')
        ?.value.split('/')
        .map((str) => Number(str)) ?? [1, 1];
    if (!currentPage) currentPage = 1;
    if (!maxPage) maxPage = 1;
    return [currentPage, maxPage];
}

export {
    notEmpty,
    ChannelId,
    commandData,
    extendedClient,
    searchForLinkCallback,
    composeCustomEmbedCallback,
    searchAndEmbedCollection,
    getLinkFromHootBotEmbed,
    getPageNumbersFromHootBotEmbed
};
