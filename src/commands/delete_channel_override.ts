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
        .setName('delete_channel_override')
        .setDescription('Set the custom rules to a channel on this server.')
        //filter out channels that are not text channels
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('The channel to set the custom rules to.')
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
        // if server doesn't exist return
        if (server === undefined) {
            await interaction.reply('This server is not in the database.');
            return;
        }
        // get channel from interaction
        const channel = interaction.options.getChannel('channel') as TextChannel;
        // if channel doesn't exist return
        if (channel === null) {
            await interaction.reply('Channel does not exist.');
            return;
        }
        // find channel in server
        const channelOverride = server.customSettingsChannels.find(
            (channelOverride) => channelOverride.channel.id === channel.id
        );
        // if channel doesn't exist return
        if (channelOverride === undefined) {
            await interaction.reply('Channel does not have custom rules.');
            return;
        }
        // delete channel from server
        server.removeChannelOverride(channelOverride.channel);
        // reply
        await interaction.reply(`Custom rules for ${channel} have been deleted.`);
    }
} as commandData;
