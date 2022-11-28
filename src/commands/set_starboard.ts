import {
    ChannelType,
    ChatInputCommandInteraction,
    GuildMember,
    PermissionsBitField,
    SlashCommandBuilder,
    TextChannel
} from 'discord.js';
import { allServerData } from '../global-stuff.js';

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
        // user must have MANAGE_CHANNELS permission
        const member = interaction.member as GuildMember;
        if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            await interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
            return;
        }
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
