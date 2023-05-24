import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    GuildMember,
    PermissionsBitField
} from 'discord.js';
import { allServerData, starboardMessages } from '../global-stuff.js';

export default {
    data: new SlashCommandBuilder()
        .setName('force_message_to_starboard')
        .setDescription('Force a message to the starboard.')
        .addStringOption((option) =>
            option
                .setName('message_id')
                .setDescription('The message to force to the starboard.')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        // user must have MANAGE_MESSAGES permission
        const member = interaction.member as GuildMember;
        if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
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
        // get message id
        const messageId = interaction.options.getString('message_id', true);
        // get message
        if (interaction.channel === null) {
            await interaction.reply('Error: Channel is null.');
            return;
        }
        const message = await interaction.channel.messages.fetch(messageId);

        // check if messages is already in the starboard
        const list = starboardMessages.get(message.guildId ?? '');
        if (list) {
            // get message from list whose id is the same as the reaction message id
            const matchedMessage = list.find((messageId) => {
                return messageId === message.id;
            });

            // If already in starboard return
            if (matchedMessage !== undefined) {
                return;
            }
        }

        const success = server.forceMessageToStarboard(message);

        // reply
        if (!success) {
            await interaction.reply('Error: Message could not be forced to starboard.');
            return;
        }
        await interaction.reply(`Message forced to starboard.`);
    }
};
