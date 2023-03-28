import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, PermissionsBitField, ChannelType, TextChannel } from "discord.js";
import { allServerData } from "../global-stuff.js";


export default {
    data: new SlashCommandBuilder()
        .setName('stop_react_logging')
        .setDescription('Stop logging reactions in this channel.'),
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
        if (server.reactionLoggingChannel === null) {
            await interaction.reply(`Reaction logging is already disabled.`);
        } else {
            server.setReactionLoggingChannel(null);
            await interaction.reply('Reaction logging disabled.');
        }
    }
}