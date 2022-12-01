# starboard-with-custom-embeds

## How does the bot work?

This is a starboard bot with support for custom embeds!
It can even resend links with broken embeds and fix them with the help of websites such as vxtwitter

When a message on a server gets a certain number (threshold) of a certain emoji (star emoji) reactions, then the bot will send the message to a 'starboard' channel. The default star emoji is ⭐️, and the default threshold is 3. You can set the starboard channel, star emoji and the threshold for each server. You can even override a particular channel with different star emoji and/or threshold requirements.

### Custom Embeds currently implemented:

- Reddit
- Instagram

### Discord Default Embed fail redirects:

- Twitter
- Pixiv

## Commands:

* [] = required parameter
* () = optional parameter

- `/ping`
  - Get ping response time

- `/set_starboard [channel]`
  - Set the starboard channel. Must be a text channel

- `/set_star_emoji [emoji]`
  - Set the default star emoji for the server. This will not affect any channel setting overrides
  - The `emoji` must be a valid unicode emoji, or a custom emoji on the server
  
- `/set_default_threshold [threshold]`
  - Set the default star threshold for the server. This will not affect any channel setting overrides
  - `threshold` is an integer and can not be negative

- `/set_channel_override [channel] (star_emoji) (threshold)`
  - Set a channel override for the starboard. This will override the default star emoji and threshold for this channel
  - `channel` must be a text channel
  - `star_emoji` must be a valid unicode emoji, or a custom emoji on the server
  - `threshold` is an integer and can not be negative

- `/delete_channel_override [channel]`
    - Delete a channel override for the starboard. This will remove the channel override and use the default star emoji and threshold for this channel instead
    - `channel` must be a text channel

- `/view_server_settings`
    - View all channel overrides for the server
    - Also shows the default star emoji and threshold for the server