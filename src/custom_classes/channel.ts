import { Snowflake, TextChannel } from 'discord.js';
import { client } from '../global-stuff.js';

class ChannelStuff {
    public readonly channel: TextChannel;
    private _enabled = true;
    private _starEmoji: string;
    private _starThreshold: number;

    get enabled(): boolean {
        return this._enabled;
    }

    get starEmoji(): string {
        return this._starEmoji;
    }

    get starThreshold(): number {
        return this._starThreshold;
    }

    constructor(
        channel: TextChannel,
        starEmoji: string,
        starThreshold: number,
        enabled: boolean = true
    ) {
        this.channel = channel;
        this._starEmoji = starEmoji;
        this._starThreshold = starThreshold;
        this._enabled = enabled;
    }

    public static fromJSON(obj: ChannelStuffBackup): ChannelStuff {
        // get channel from channelId

        const channel = client.channels.cache.get(obj.channelId) as TextChannel;

        return new ChannelStuff(channel, obj.starEmoji, obj.starThreshold, obj.enabled);
    }

    public toJSON(): ChannelStuffBackup {
        return {
            channelId: this.channel.id,
            starEmoji: this._starEmoji,
            starThreshold: this._starThreshold,
            enabled: this._enabled
        };
    }

    public setStarEmoji(emoji: string): void {
        this._starEmoji = emoji;
    }

    public setStarThreshold(threshold: number): void {
        this._starThreshold = threshold;
    }

    public setEnabled(enabled: boolean): void {
        this._enabled = enabled;
    }
}

type ChannelStuffBackup = {
    channelId: Snowflake;
    starEmoji: string;
    starThreshold: number;
    enabled: boolean;
};

export { ChannelStuff, ChannelStuffBackup };
