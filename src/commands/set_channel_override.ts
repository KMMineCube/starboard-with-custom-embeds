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
        .setName('set_channel_override')
        .setDescription('Set the custom rules to a channel on this server.')
        //filter out channels that are not text channels
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('The channel to set the custom rules to.')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption((option) =>
            option
                .setName('star_emoji')
                .setDescription('The emoji to use for starring messages.')
                .setRequired(false)
        )
        .addIntegerOption((option) =>
            option
                .setName('star_threshold')
                .setDescription(
                    'The number of stars required to post a message to the starboard.'
                )
                .setRequired(false)
        )
        .addBooleanOption((option) =>
            option
                .setName('enabled')
                .setDescription(
                    'Whether or not to enable the custom rules for this channel.'
                )
                .setRequired(false)
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
            const newStarEmoji =
                interaction.options.getString('star_emoji') ?? server.defaultStarEmoji;
            const newStarThreshold =
                interaction.options.getInteger('star_threshold') ??
                server.defaultStarThreshold;
            const newEnabled = interaction.options.getBoolean('enabled') ?? true;
            server.setChannelOverride(
                newChannel as TextChannel,
                newStarEmoji,
                newStarThreshold,
                newEnabled
            );
            await interaction.reply(`*Channel override set for ${newChannel.toString()}* : \n
*Star emoji:* **${newStarEmoji}** \n
*Star threshold:* **${newStarThreshold}** \n
*Enabled:* **${newEnabled}**`);
        } else {
            await interaction.reply('Error: Channel provided is not a text channel.');
        }
    }
} as commandData;
