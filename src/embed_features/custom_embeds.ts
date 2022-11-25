import {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    HexColorString,
    Message,
    PartialMessage,
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
    imageLink: string | null,
    sender: User,
    color: number | HexColorString,
    addButtons: boolean,
    pageNumber: number = 1,
    maxPageNumber: number = 1
): BaseMessageOptions {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setImage(imageLink)
        .addFields(
            [
                {
                    name: 'Sender',
                    value: sender.toString(),
                    inline: true
                },
                {
                    name: 'Source',
                    value: `[Click here](${url})`,
                    inline: true
                }
            ].concat(
                maxPageNumber > 1
                    ? [
                          {
                              name: 'Page',
                              value: `${pageNumber}/${maxPageNumber}`,
                              inline: false
                          }
                      ]
                    : []
            )
        )
        .setFooter({
            text:
                `HootBot v0.0.1` +
                (addButtons ? ` | Page ${pageNumber} of ${maxPageNumber}` : ``)
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

function starboardEmbed(message: Message | PartialMessage): BaseMessageOptions {
    const embed = new EmbedBuilder()
        .setTitle(
            message.member?.displayName ?? message.author?.username ?? 'Unknown User'
        )
        .setDescription(message.content)
        .setFields([
            {
                name: 'Author',
                value: message.author?.toString() ?? 'Unknown User',
                inline: true
            },
            {
                name: 'Channel',
                value: message.channel.toString(),
                inline: true
            },
            {
                name: 'Location',
                value: `[Click here](${message.url})`,
                inline: true
            }
        ]);

    if (message.attachments.size > 0) {
        const url = message.attachments.first()?.url;
        if (url) {
            embed.setImage(url);
        }
    }

    return { embeds: [embed] };
}

export { generic_custom_embed, starboardEmbed };
