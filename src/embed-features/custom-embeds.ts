import {
    ActionRowBuilder,
    APIEmbedField,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    EmbedBuilder,
    HexColorString,
    Message,
    PartialMessage,
    User
} from 'discord.js';
import { getSenderIdFromHootBotEmbed } from './embed-utils.js';

/**
 * Creates a custom hootbot embed
 * @param title
 * @param description
 * @param url
 * @param imageLink
 * @param sender
 * @param color
 * @param addPageButtons
 * @param pageNumber
 * @param maxPageNumber
 * @returns
 */
function genericCustomEmbed(
    title: string,
    description: string,
    url: string,
    imageLink: string | null,
    sender: User,
    color: number | HexColorString,
    pageNumber: number = 1,
    maxPageNumber: number = 1,
    linkPostInfo: string | null = null
): BaseMessageOptions {
    const multiPageEmbed = maxPageNumber > 1;

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
                name: 'Source',
                value: `[Click here](${url})`,
                inline: true
            },
            {
                //empty field to force new field(s) to be on a new line
                name: '\u200b',
                value: '\u200b',
                inline: true
            }
        ])
        .setFooter({
            text:
                `HootBot v3.0.0` +
                (multiPageEmbed ? ` | Page ${pageNumber} of ${maxPageNumber}` : ``)
        })
        .setColor(color);

    if (linkPostInfo) {
        embed.addFields({
            name: 'Post Info',
            value: linkPostInfo,
            inline: true
        });
    }
    if (maxPageNumber > 1) {
        embed.addFields({
            name: 'Page',
            value: `${pageNumber}/${maxPageNumber}`,
            inline: true
        });
    }

    const buttons = new ActionRowBuilder<ButtonBuilder>();
    if (multiPageEmbed) {
        buttons
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
            );
    }
    buttons.addComponents(
        new ButtonBuilder()
            .setCustomId('delete')
            .setEmoji('🗑')
            .setLabel('Delete')
            .setStyle(ButtonStyle.Danger)
    );
    return { embeds: [embed], components: [buttons] };
}

function starboardEmbedFromUser(message: Message | PartialMessage): BaseMessageOptions {
    const embed = new EmbedBuilder()
        .setDescription(message.content ?? null)
        .setFields([
            {
                name: 'Channel',
                value: message.channel.toString(),
                inline: true
            },
            {
                name: 'Location',
                value: `[Go to Message](${message.url})`,
                inline: true
            }
        ])
        .setAuthor({
            name: message.author?.username ?? 'Unknown User',
            iconURL: message.author?.avatarURL() ?? undefined
        })
        .setFooter({
            text: `HootBot v3.0.0`
        })
        .setColor(Colors.Yellow);

    if (message.attachments.size > 0) {
        const firstAttachment = message.attachments.first();
        if (firstAttachment) {
            const url = firstAttachment.url;
            if (
                url &&
                (firstAttachment.contentType?.includes('image/') ||
                    firstAttachment.contentType?.includes('gif/'))
            ) {
                embed.setImage(url);
            }
        }
    }

    const nonImageAttachments = message.attachments.filter((att) => {
        const contentType = att.contentType;
        return (
            contentType &&
            !contentType.includes('image/') &&
            !contentType.includes('gif/')
        );
    });

    return {
        embeds: [embed, ...message.embeds],
        files: [...nonImageAttachments.values()]
    };
}

function starboardEmbedFromBot(message: Message | PartialMessage): BaseMessageOptions {
    const botEmbed = message.embeds[0];
    // This should never be called, but just in case
    if (!botEmbed) {
        return { embeds: [] };
    }

    const newBotEmbedJSON = botEmbed.toJSON();

    const authorId = getSenderIdFromHootBotEmbed(botEmbed);
    if (authorId !== null) {
        // get user from author id
        const author = message.client.users.cache.get(authorId);
        newBotEmbedJSON.author = {
            name: author?.username ?? 'Unknown User',
            icon_url: author?.avatarURL() ?? undefined
        };
    }

    // remove title
    newBotEmbedJSON.title = undefined;
    // add channel to fields

    const newFields: APIEmbedField[] = [
        {
            name: 'Channel',
            value: message.channel.toString(),
            inline: true
        },
        {
            name: 'Location',
            value: `[Go to Message](${message.url})`,
            inline: true
        }
    ];

    // if fields exist, then take the source field and append it to the end
    if (newBotEmbedJSON.fields) {
        const sourceField = newBotEmbedJSON.fields.find(
            (field) => field.name === 'Source'
        );
        if (sourceField) {
            newFields.push(sourceField);
        }
    }

    newBotEmbedJSON.fields = newFields;

    // change color to yellow

    newBotEmbedJSON.color = Colors.Yellow;

    const newBotEmbed = new EmbedBuilder(newBotEmbedJSON);

    return {
        embeds: [newBotEmbed, ...message.embeds.slice(1)],
        files: [...message.attachments.values()]
    };
}

function starboardEmbed(message: Message | PartialMessage): BaseMessageOptions {
    // if the message is from a bot, use the bot's embed
    if (message.author?.bot && message.embeds.length > 0) {
        return starboardEmbedFromBot(message);
    } else {
        return starboardEmbedFromUser(message);
    }
}

export { genericCustomEmbed, starboardEmbed };
