import {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    HexColorString,
    User
} from 'discord.js';

/**
 * Creates a custom hootbot embed
 * @param title
 * @param description
 * @param url
 * @param imageLink
 * @param sender
 * @param color
 * @param addButtons
 * @param pageNumber
 * @param maxPageNumber
 * @returns
 */
function generic_custom_embed(
    title: string,
    description: string,
    url: string,
    imageLink: string,
    sender: User,
    color: number | HexColorString,
    addButtons: boolean,
    pageNumber: number,
    maxPageNumber: number
): BaseMessageOptions {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setImage(imageLink)
        .addFields([
            {
                name: 'Sender',
                value: sender.toString(),
                inline: true
            },
            {
                name: 'Page',
                value: `${pageNumber}/${maxPageNumber}`,
                inline: true
            },
            {
                name: 'Source',
                value: `[Click here](${url})`,
                inline: false
            }
        ])
        .setFooter({
            text:
                `HootBot v0.0.1 |` +
                (addButtons ? ` Page ${pageNumber} of ${maxPageNumber}` : ``)
        })
        .setColor(color);

    if (addButtons) {
        const buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev_page')
                    .setEmoji('⬅️')
                    .setDisabled(pageNumber === 1)
                    .setLabel('Previous Page')
                    .setStyle(ButtonStyle.Primary)
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setDisabled(pageNumber === maxPageNumber)
                    .setEmoji('➡️')
                    .setLabel('Next Page')
                    .setStyle(ButtonStyle.Primary)
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('delete')
                    .setEmoji('🗑')
                    .setLabel('Delete')
                    .setStyle(ButtonStyle.Danger)
            );
        return { embeds: [embed], components: [buttons] };
    } else {
        return { embeds: [embed] };
    }
}

export { generic_custom_embed };
