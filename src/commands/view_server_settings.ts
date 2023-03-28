import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionsBitField,
    SlashCommandBuilder
} from 'discord.js';
import { allServerData } from '../global-stuff.js';

import { commandData } from '../utilities.js';

export default {
    data: new SlashCommandBuilder()
        .setName('view_server_settings')
        .setDescription('View the starboard overrides for this server.'),
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
        // get starboard channel
        const starboardChannel = server.starboardChannel;
        if (!starboardChannel) {
            await interaction.reply('Error: Starboard channel not set.');
            return;
        }
        // get starboard overrides
        const starboardOverrides = server.customSettingsChannels;
        // generate embed
        const embed = new EmbedBuilder()
            .setTitle('Starboard Overrides')
            .setDescription(
                `Starboard channel: ${starboardChannel.toString()}\nDefault star emoji: ${
                    server.defaultStarEmoji
                }`
            )
            .setColor(0x00ff00);
        // add fields for each override
        starboardOverrides.forEach((override) => {
            embed.addFields({
                name: `Channel: ${override.channel.toString()}`,
                value: `Star emoji: ${override.starEmoji}
                    \nStar count: ${override.starThreshold}
                    \nEnabled: ${override.enabled}`
            });
        });

        // reaction logging
        const reactionLoggingChannel = server.reactionLoggingChannel;
        if (reactionLoggingChannel) {
            embed.addFields({
                name: 'Reaction Logging',
                value:
                    `Add Enabled: ${server.reactionLogMode % 0b10}` +
                    `\nRemove Enabled: ${server.reactionLogMode % 0b01}` +
                    `\nChannel: ${reactionLoggingChannel.toString()}`
            });
        }
        await interaction.reply({ embeds: [embed] });
    }
} as commandData;
