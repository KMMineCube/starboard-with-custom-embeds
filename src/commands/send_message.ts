import {
    ChannelType,
    ChatInputCommandInteraction,
    GuildMember,
    PermissionsBitField,
    SlashCommandBuilder,
    TextChannel
} from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('send_message')
        .setDescription('Send a message to a channel.')
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('The channel to send the message to.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('message')
                .setDescription('The message to send.')
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
        const channel = interaction.options.getChannel('channel', true) as TextChannel;
        const message = interaction.options.getString('message', true);
        if (channel.type !== ChannelType.GuildText) {
            await interaction.reply('Error: Channel provided is not a text channel.');
            return;
        }

        await channel.send(message);

        await interaction.reply(
            `The following message was sent to ${channel.toString()}:\n\n${message}`
        );
    }
};
