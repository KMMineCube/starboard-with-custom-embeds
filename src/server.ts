import { Guild, Emoji, Collection } from 'discord.js';
import ChannelStuff from './channel.js';
import { ChannelId } from './utilities.js';

class GuildStuff {
    public readonly guild: Guild;
    private _defaultStarEmoji: string;
    private _defaultStarThreshold: number;
    private _starboardChannel: ChannelStuff | null = null;
    private _customSettingsChannels: Collection<ChannelId, ChannelStuff>;

    get defaultStarEmoji(): string {
        return this._defaultStarEmoji;
    }

    get defaultStarThreshold(): number {
        return this._defaultStarThreshold;
    }

    get starboardChannel(): ChannelStuff | null {
        return this._starboardChannel;
    }

    get customSettingsChannels(): Collection<ChannelId, ChannelStuff> {
        return this._customSettingsChannels;
    }

    constructor(
        guild: Guild,
        defaultStarEmoji: string,
        defaultStarThreshold: number,
        starboardChannel: ChannelStuff | null,
        customSettingsChannels: Collection<ChannelId, ChannelStuff>
    ) {
        this.guild = guild;
        this._defaultStarEmoji = defaultStarEmoji;
        this._defaultStarThreshold = defaultStarThreshold;
        this._starboardChannel = starboardChannel;
        this._customSettingsChannels = customSettingsChannels;
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
