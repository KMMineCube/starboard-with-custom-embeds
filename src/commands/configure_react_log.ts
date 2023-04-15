import {
    ChatInputCommandInteraction,
    GuildMember,
    PermissionsBitField,
    SlashCommandBuilder
} from 'discord.js';
import { allServerData } from '../global-stuff.js';

export default {
    data: new SlashCommandBuilder()
        .setName('configure_react_log')
        .setDescription('Configure reaction logging for this server.')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription('Enable reaction add logging for this server.')
                .addBooleanOption((option) =>
                    option
                        .setName('log_reactions')
                        .setDescription('Log reactions to the reaction log channel.')
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('Enable reaction remove logging for this server.')
                .addBooleanOption((option) =>
                    option
                        .setName('log_reactions')
                        .setDescription('Log reactions to the reaction log channel.')
                        .setRequired(true)
                )
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
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'add') {
            const logReactions = interaction.options.getBoolean('log_reactions', true);
            if (logReactions) {
                server.enableReactionAddLogging();
                await interaction.reply('Logging reaction additions.');
            } else {
                server.disableReactionAddLogging();
                await interaction.reply('Stopped logging reaction additions.');
            }
        } else if (subcommand === 'remove') {
            const logReactions = interaction.options.getBoolean('log_reactions', true);
            if (logReactions) {
                server.enableReactionRemoveLogging();
                await interaction.reply('Logging reaction deletions.');
            } else {
                server.disableReactionRemoveLogging();
                await interaction.reply('Stopped logging reaction deletions.');
            }
        }
    }
};
