import { Guild, Collection, TextChannel } from 'discord.js';
import ChannelStuff from './channel.js';
import { ChannelId } from '../utilities.js';

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

    public setCustomSettingsChannel(channel: ChannelStuff): void {
        this._customSettingsChannels.set(channel.channel.id, channel);
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
