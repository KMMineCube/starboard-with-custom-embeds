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
        .setName('set_star_emoji')
        .setDescription('Set the emoji to use for starring messages.')
        .addStringOption((option) =>
            option
                .setName('emoji')
                .setDescription('The emoji to use for starring messages.')
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
        const newEmoji = interaction.options.getString('emoji', true);

        // check if it's a unicode emoji
        const emoji =
            newEmoji.match(/\p{Emoji}/u) ??
            // check if it's a custom emote
            // custom emoji format: <:name:id>
            interaction.guild?.emojis.cache.find((emoji) => {
                return `<:${emoji.name}:${emoji.id}>` === newEmoji;
            });
        if (!emoji) {
            await interaction.reply({
                content: 'Invalid emoji.',
                ephemeral: true
            });
            return;
        }

        server.setDefaultStarEmoji(newEmoji);
        await interaction.reply(
            `Default star emoji set to ${newEmoji}. Specific channel overrides have not been updated.`
        );
    }
} as commandData;
