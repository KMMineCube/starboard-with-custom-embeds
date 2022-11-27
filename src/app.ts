import { Collection, Events } from 'discord.js';

import bot_creds from '../bot_creds.json' assert { type: 'json' };
import { handleButton } from './button_handler.js';
import { allServerData, client } from './global-stuff.js';
import { replaceLinkWithEmbed } from './embed_features/message_to_embed.js';
import GuildStuff from './custom_classes/server.js';

client.on(Events.ClientReady, () => {
    console.log('\nBot is ready!');

    client.guilds.cache.forEach((guild) => {
        allServerData.set(
            guild.id,
            new GuildStuff(guild, '⭐', 3, null, new Collection())
        );
    });

    client.deployCommands();
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
    const server = allServerData.get(reaction.message.guildId ?? '');
    if (server === undefined) {
        return;
    }
    server.handleReaction(reaction);
});
