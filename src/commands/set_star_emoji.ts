import {
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    TextChannel
} from 'discord.js';
import { allServerData } from '../global-stuff.js';

import { commandData } from '../utilities.js';

export default {
    data: new SlashCommandBuilder()
        .setName('set_star_emoji')
        .setDescription('Set the emoji to use for starring messages.')
        .addStringOption((option) =>
            option
                .setName('emoji')
                .setDescription('The emoji to use for starring messages.')
                .setRequired(true)
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
        const newEmoji = interaction.options.getString('emoji', true);
        server.setDefaultStarEmoji(newEmoji);
        await interaction.reply(
            `Default star emoji set to ${newEmoji}. Specific channel overrides have not been updated.`
        );
    }
} as commandData;
