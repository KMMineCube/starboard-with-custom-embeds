import { Emoji, TextChannel } from 'discord.js';

class ChannelStuff {
    public readonly channel: TextChannel;
    private _enabled = true;
    private _starEmoji: Emoji;
    private _starThreshold: number;

    get enabled(): boolean {
        return this._enabled;
    }

    get starEmoji(): Emoji {
        return this._starEmoji;
    }

    get starThreshold(): number {
        return this._starThreshold;
    }

    constructor(channel: TextChannel, starEmoji: Emoji, starThreshold: number) {
        this.channel = channel;
        this._starEmoji = starEmoji;
        this._starThreshold = starThreshold;
    }

    public static fromJSON(json: string): ChannelStuff {
        const obj = JSON.parse(json);
        return new ChannelStuff(obj.channel, obj.starEmoji, obj.starThreshold);
    }

    public toJSON(): string {
        return JSON.stringify(this);
    }

    public setStarEmoji(emoji: Emoji): void {
        this._starEmoji = emoji;
    }

    public setStarThreshold(threshold: number): void {
        this._starThreshold = threshold;
    }

    public setEnabled(enabled: boolean): void {
        this._enabled = enabled;
    }
}

export default ChannelStuff;
