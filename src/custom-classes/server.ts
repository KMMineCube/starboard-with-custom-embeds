import {
    Guild,
    Collection,
    TextChannel,
    MessageReaction,
    PartialMessageReaction,
    Snowflake
} from 'discord.js';
import { ChannelStuff, ChannelStuffBackup } from './channel.js';
import { ChannelId } from '../utilities.js';
import { starboardEmbed } from '../embed-features/custom-embeds.js';
import { appendNewStarboardMessageId, backupServerSettings } from '../backups.js';
import { client, starboardMessages } from '../global-stuff.js';

class GuildStuff {
    public readonly guild: Guild;
    private _defaultStarEmoji: string;
    private _defaultStarThreshold: number;
    private _starboardChannel: TextChannel | null = null;
    private _customSettingsChannels: Collection<ChannelId, ChannelStuff>;

    get defaultStarEmoji(): string {
        return this._defaultStarEmoji;
    }

    get defaultStarThreshold(): number {
        return this._defaultStarThreshold;
    }

    get starboardChannel(): TextChannel | null {
        return this._starboardChannel;
    }

    get customSettingsChannels(): Collection<ChannelId, ChannelStuff> {
        return this._customSettingsChannels;
    }

    constructor(
        guild: Guild,
        defaultStarEmoji: string,
        defaultStarThreshold: number,
        starboardChannel: TextChannel | null,
        customSettingsChannels: Collection<ChannelId, ChannelStuff>
    ) {
        this.guild = guild;
        this._defaultStarEmoji = defaultStarEmoji;
        this._defaultStarThreshold = defaultStarThreshold;
        this._starboardChannel = starboardChannel;
        this._customSettingsChannels = customSettingsChannels;
    }

    public setStarboardChannel(channel: TextChannel | null): void {
        this._starboardChannel = channel;
        backupServerSettings(this.guild.id);
    }

    public setDefaultStarEmoji(emoji: string): void {
        this._defaultStarEmoji = emoji;
        backupServerSettings(this.guild.id);
    }

    public setDefaultStarThreshold(threshold: number): void {
        this._defaultStarThreshold = threshold;
        backupServerSettings(this.guild.id);
    }

    public setChannelOverride(
        channel: TextChannel,
        starEmoji: string,
        starThreshold: number,
        enabled: boolean
    ): void {
        this._customSettingsChannels.set(
            channel.id,
            new ChannelStuff(channel, starEmoji, starThreshold, enabled)
        );
        backupServerSettings(this.guild.id);
    }

    public removeChannelOverride(channel: TextChannel): void {
        this._customSettingsChannels.delete(channel.id);
        backupServerSettings(this.guild.id);
    }

    public handleReaction(reaction: MessageReaction | PartialMessageReaction): boolean {
        // if message is in starboard channel, ignore
        if (reaction.message.channel.id === this._starboardChannel?.id) {
            return false;
        }
        // check for channel overrides
        const channelOverride = this._customSettingsChannels.get(
            reaction.message.channel.id
        );
        if (this._starboardChannel === null) {
            return false;
        }

        let approvedForStarboard = false;

        if (channelOverride) {
            if (channelOverride.enabled) {
                if (
                    reaction.emoji.toString() === channelOverride.starEmoji &&
                    reaction.count === channelOverride.starThreshold
                ) {
                    approvedForStarboard = true;
                }
            }
        } else {
            if (
                reaction.emoji.toString() === this._defaultStarEmoji &&
                reaction.count === this._defaultStarThreshold
            ) {
                approvedForStarboard = true;
            }
        }

        if (approvedForStarboard) {
            this._starboardChannel.send(starboardEmbed(reaction.message));
            const oldList = starboardMessages.get(this.guild.id);

            // append the new message to the front of the list

            if (oldList) {
                oldList.unshift(reaction.message.id);
                starboardMessages.set(this.guild.id, oldList);
            } else {
                starboardMessages.set(this.guild.id, [reaction.message.id]);
            }
            appendNewStarboardMessageId(this.guild.id, reaction.message.id);
            return true;
        }
        return false;
    }

    public static async fromJSON(obj: GuildStuffBackup): Promise<GuildStuff> {
        const guild = client.guilds.cache.get(obj.guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }
        const starboardChannel = obj.starboardChannelId
            ? (guild.channels.cache.get(obj.starboardChannelId) as TextChannel)
            : null;

        const customSettingsChannels = new Collection<ChannelId, ChannelStuff>();
        obj.customSettingsChannels.forEach((value) => {
            const channel = guild.channels.cache.get(value.channelId);
            if (channel) {
                customSettingsChannels.set(
                    value.channelId,
                    new ChannelStuff(
                        channel as TextChannel,
                        value.starEmoji,
                        value.starThreshold,
                        value.enabled
                    )
                );
            }
        });

        return new GuildStuff(
            guild,
            obj.defaultStarEmoji,
            obj.defaultStarThreshold,
            starboardChannel,
            customSettingsChannels
        );
    }

    public toJSON(): GuildStuffBackup {
        return {
            guildId: this.guild.id,
            defaultStarEmoji: this._defaultStarEmoji,
            defaultStarThreshold: this._defaultStarThreshold,
            starboardChannelId: this._starboardChannel?.id ?? null,
            customSettingsChannels: this._customSettingsChannels.map((value) =>
                value.toJSON()
            )
        };
    }
}

type GuildStuffBackup = {
    guildId: Snowflake;
    defaultStarEmoji: string;
    defaultStarThreshold: number;
    starboardChannelId: Snowflake | null;
    customSettingsChannels: ChannelStuffBackup[];
};

export { GuildStuff, GuildStuffBackup };
