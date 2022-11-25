import {
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    TextChannel
} from 'discord.js';
import { allServerData } from '../custom_classes/extended_client.js';

import { commandData } from '../utilities.js';

export default {
    data: new SlashCommandBuilder()
        .setName('set_starboard')
        .setDescription('Set the starboard channel for this server.')
        //filter out channels that are not text channels
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('The channel to set as the starboard channel.')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        // find server in allserverdata
        const server = allServerData.find(
            (server) => server.guild.id === interaction.guildId
        );
        if (!server) {
            console.error(
                `Error: server ${interaction.guildId} not found in allServerData.`
            );
            return;
        }
        // set starboard channel
        const newChannel = interaction.options.getChannel('channel', true);
        if (newChannel.type === ChannelType.GuildText) {
            server.setStarboardChannel(newChannel as TextChannel);
            await interaction.reply(`Starboard channel set to ${newChannel.toString()}`);
        } else {
            await interaction.reply('Error: Channel provided is not a text channel.');
        }
    }
} as commandData;
