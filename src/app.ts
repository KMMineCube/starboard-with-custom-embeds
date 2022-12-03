import { Collection, Events } from 'discord.js';

import { handleButton } from './button-handler.js';
import { allServerData, client, starboardMessages } from './global-stuff.js';
import { replaceLinkWithEmbed } from './embed-features/message-to-embed.js';
import { GuildStuff } from './custom-classes/server.js';
import { restoreServerSettings, restoreStarboardMessages } from './backups.js';

import bot_creds from '../bot_creds.json' assert { type: 'json' };

client.on(Events.ClientReady, async () => {
    console.log('\nBot is ready!');

    await restoreServerSettings();

    await restoreStarboardMessages();

    client.guilds.cache.forEach((guild) => {
        // read backup file
        // if file doesn't exist create new GuildStuff
        // if file does exist read data from file

        if (allServerData.has(guild.id)) {
            return;
        }
        allServerData.set(
            guild.id,
            new GuildStuff(guild, '⭐', 3, null, new Collection())
        );
    });

    client.deployCommands();
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    await replaceLinkWithEmbed(message);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
        handleButton(interaction);
    }
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
});

client.on(Events.GuildCreate, (guild) => {
    allServerData.set(guild.id, new GuildStuff(guild, '⭐', 3, null, new Collection()));
});

client.on(Events.GuildDelete, (guild) => {
    allServerData.delete(guild.id);
});

client.on(Events.GuildEmojiDelete, (emoji) => {
    const server = allServerData.get(emoji.guild.id);
    if (server === undefined) {
        return;
    }
    if (server.defaultStarEmoji === emoji.toString()) {
        server.setDefaultStarEmoji('⭐');
    }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (reaction.partial) {
        const fullReaction = await reaction.fetch().catch((err) => {
            console.error('Something went wrong when fetching the message: ', err);
            return undefined;
        });
        if (!fullReaction) {
            return;
        }
        reaction = fullReaction;
    }

    // check if messages is already in the starboard
    const list = starboardMessages.get(reaction.message.guildId ?? '');
    if (list) {
        // get message from list whose id is the same as the reaction message id
        const message = list.find((messageId) => {
            return messageId === reaction.message.id;
        });

        // If already in starboard return
        if (message !== undefined) {
            return;
        }
    }

    const server = allServerData.get(reaction.message.guildId ?? '');
    if (server === undefined) {
        return;
    }
    server.handleReaction(reaction);
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
