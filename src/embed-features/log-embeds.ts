import { BaseMessageOptions, EmbedBuilder, MessageReaction, User } from 'discord.js';

function ReactionAddLogEmbed(reaction: MessageReaction, reactor: User): BaseMessageOptions {
    const logEmbed = new EmbedBuilder()
        .setTitle(`${reactor.username} reacted with ${reaction.emoji}`)
        .setThumbnail(reactor.avatarURL())
        .setTimestamp(new Date())
        .setColor(0x00ff00)
        .setFields([
            {
                name: 'User',
                value: `${reactor.toString()} (${reactor.id})`,
                inline: true
            },
            {
                name: 'Channel',
                value: reaction.message.channel.toString(),
                inline: true
            },
            {
                name: 'Location',
                value: `[Go to Message](${reaction.message.url})`,
                inline: true
            }
        ])
        .setFooter({
            text: `HootBot v3.0.0`
        });

    if (reaction.message.content !== null) {
        logEmbed.setDescription(
            `Message content: \`\`\`${
                reaction.message.content.length < 1000
                    ? reaction.message.content
                    : reaction.message.content.slice(0, 1000) + '...'
            }\`\`\``
        );
    }

    return {
        embeds: [logEmbed]
    };
}

function ReactionRemoveLogEmbed(reaction: MessageReaction, reactor: User): BaseMessageOptions {
    const logEmbed = new EmbedBuilder()
        .setTitle(`${reactor.username} removed ${reaction.emoji}`)
        .setThumbnail(reactor.avatarURL())
        .setTimestamp(new Date())
        .setColor(0xff0000)
        .setFields([
            {
                name: 'User',
                value: `${reactor.toString()} (${reactor.id})`,
                inline: true
            },
            {
                name: 'Channel',
                value: reaction.message.channel.toString(),
                inline: true
            },
            {
                name: 'Location',
                value: `[Go to Message](${reaction.message.url})`,
                inline: true
            }
        ])
        .setFooter({
            text: `HootBot v3.0.0`
        });

    if (reaction.message.content !== null) {
        logEmbed.setDescription(
            `Message content: \`\`\`${
                reaction.message.content.length < 1000
                    ? reaction.message.content
                    : reaction.message.content.slice(0, 1000) + '...'
            }\`\`\``
        );
    }

    return {
        embeds: [logEmbed]
    };
}

export { ReactionAddLogEmbed, ReactionRemoveLogEmbed };