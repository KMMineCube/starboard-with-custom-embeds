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

- `/force_message_to_starboard [message_id]`
  - This command forces a message to go into the starboard. Useful if a message worthy of being in the starboard has been overflown by reactions that aren't the star emoji
  - `message_id` is the id of the message you want to force into the starboard

- `/configure_react_log {add/remove} [log_reactions]`
  - Log emoji reactions to all message on your server using this command.
  - `add/remove` is the subcommand to configure tracking reaction adds and reaction removes (i.e. unreacting)
  - `log_reaction` is a boolean. If set true, it will track the coressponding reaciton event (either add or remove)

- `/set_react_log_channel [channel]`
  - Set a channel where the bot will post reaction logs
  - `channel` must be a channel that the bot has access to send messages in

- `/stop_react_logging`
  - disable reaction logging

- `/view_server_settings`
    - View all channel overrides for the server
    - Also shows the default star emoji and threshold for the server
    - View configuration for reaction logging
