import { Collection, Events } from 'discord.js';

import { handleButton } from './button_handler.js';
import { allServerData, client } from './global-stuff.js';
import { replaceLinkWithEmbed } from './embed_features/message_to_embed.js';
import { GuildStuff } from './custom_classes/server.js';
import { restoreServerSettings } from './backups.js';

client.on(Events.ClientReady, () => {
    console.log('\nBot is ready!');

    restoreServerSettings();

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
        try {
            reaction = await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message: ', error);
            return;
        }
    }

    const server = allServerData.get(reaction.message.guildId ?? '');
    if (server === undefined) {
        return;
    }
    server.handleReaction(reaction);
});
