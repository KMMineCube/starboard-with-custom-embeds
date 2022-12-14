import { ButtonInteraction, GuildMember, PermissionsBitField } from 'discord.js';
import {
    getSourceLinkFromHootBotEmbed,
    getPageNumbersFromHootBotEmbed,
    searchAndEmbedCollection,
    getSenderIdFromHootBotEmbed
} from './embed-features/embed-utils.js';

/**
 * Handles button interactions.
 * @param interaction The interaction to handle.
 */
async function handleButton(interaction: ButtonInteraction): Promise<void> {
    if (interaction.customId === 'delete') {
        deleteEmbed(interaction);
    } else if (interaction.customId === 'next_page') {
        shiftPage(interaction, 'next');
    } else if (interaction.customId === 'prev_page') {
        shiftPage(interaction, 'prev');
    }
}

/**
 * Deletes the embed that the button is in.
 * @param interaction
 */
async function deleteEmbed(interaction: ButtonInteraction): Promise<void> {
    if (
        interaction.message.embeds[0]?.fields[0]?.value === interaction.user.toString() ||
        (interaction.member as GuildMember)?.permissions.has(
            PermissionsBitField.Flags.ManageMessages
        )
    ) {
        await interaction.message.delete();
    } else {
        await interaction.reply({
            content:
                'Only the sender of the link or a moderator can delete this message.',
            ephemeral: true
        });
    }
}

/**
 * Shifts the page of the embed that the button is in.
 * @param interaction
 * @param direction 'next' or 'prev'
 * @returns
 */
async function shiftPage(
    interaction: ButtonInteraction,
    direction: 'next' | 'prev'
): Promise<void> {
    const embed = interaction.message.embeds[0];
    if (embed === undefined) {
        return;
    }

    const [link, type] = await getSourceLinkFromHootBotEmbed(embed);
    if (link === null) {
        return;
    }
    await interaction.update({
        embeds: [
            {
                title: 'Loading...',
                color: embed.color ?? 0x000000
            }
        ]
    });

    const senderId = getSenderIdFromHootBotEmbed(embed);
    const sender = await interaction.client.users.fetch(senderId ?? interaction.user);

    const [currentPage, maxPage] = await getPageNumbersFromHootBotEmbed(embed);

    const condition = direction === 'next' ? currentPage < maxPage : currentPage > 1;
    if (condition) {
        let newEmbed = await searchAndEmbedCollection
            .find((obj) => obj.type === type)
            ?.composeEmbedFunction(
                link,
                embed?.description ?? '',
                sender,
                direction === 'next' ? currentPage + 1 : currentPage - 1
            );
        if (newEmbed) {
            await interaction.message.edit(newEmbed);
        }
    } else {
        await interaction.reply({
            content:
                direction === 'next'
                    ? 'This is the last page.'
                    : 'This is the first page.',
            ephemeral: true
        });
    }
}

export { handleButton };
