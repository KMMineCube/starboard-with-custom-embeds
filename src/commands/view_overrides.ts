import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js';
import { allServerData } from '../global-stuff.js';

import { commandData } from '../utilities.js';

export default {
    data: new SlashCommandBuilder()
        .setName('view_overrides')
        .setDescription('View the starboard overrides for this server.'),
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
        await interaction.reply({ embeds: [embed] });
    }
} as commandData;
