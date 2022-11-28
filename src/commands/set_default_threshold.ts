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
        .setName('set_default_threshold')
        .setDescription('Set the default threshold for starring messages.')
        .addIntegerOption((option) =>
            option
                .setName('threshold')
                .setDescription('The threshold to use for starring messages.')
                .setRequired(true)
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
        const newThreshold = interaction.options.getInteger('threshold', true);
        server.setDefaultStarThreshold(newThreshold);
        await interaction.reply(
            `Default star threshold set to ${newThreshold}. Specific channel overrides have not been updated.`
        );
    }
} as commandData;
