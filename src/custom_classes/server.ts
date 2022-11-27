import {
    Guild,
    Collection,
    TextChannel,
    MessageReaction,
    PartialMessageReaction
} from 'discord.js';
import ChannelStuff from './channel.js';
import { ChannelId } from '../utilities.js';
import { starboardEmbed } from '../embed_features/custom_embeds.js';

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
    }

    public setDefaultStarEmoji(emoji: string): void {
        this._defaultStarEmoji = emoji;
    }

    public setDefaultStarThreshold(threshold: number): void {
        this._defaultStarThreshold = threshold;
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
        if (channelOverride) {
            if (channelOverride.enabled) {
                if (
                    reaction.emoji.name === channelOverride.starEmoji &&
                    reaction.count === channelOverride.starThreshold
                ) {
                    this._starboardChannel.send(starboardEmbed(reaction.message));
                    return true;
                }
            }
        } else {
            if (
                reaction.emoji.name === this._defaultStarEmoji &&
                reaction.count === this._defaultStarThreshold
            ) {
                this._starboardChannel.send(starboardEmbed(reaction.message));
                return true;
            }
        }
        return false;
    }

    public static fromJSON(json: string): GuildStuff {
        const obj = JSON.parse(json);
        return new GuildStuff(
            obj.guild,
            obj.defaultStarEmoji,
            obj.defaultStarThreshold,
            obj.starboardChannel,
            obj.customSettingsChannels
        );
    }

    public toJSON(): string {
        return JSON.stringify(this);
    }
}

export default GuildStuff;
