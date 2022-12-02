// store server settings in sql database

import { Collection, Snowflake } from 'discord.js';
import path from 'path';
import { GuildStuff, GuildStuffBackup } from './custom-classes/server.js';
import {
    allServerData,
    client,
    starboardMessages,
    _src_dirname
} from './global-stuff.js';

import fs from 'node:fs';

type backupData = {
    [key: string]: GuildStuffBackup;
};

async function backupServerSettings(guildId: Snowflake): Promise<void> {
    const backups = new Collection<string, GuildStuffBackup>();

    allServerData.forEach((value, key) => {
        backups.set(key, value.toJSON());
    });

    const json = JSON.stringify(backups.toJSON());
    const backupFile = path.join(_src_dirname, '../../backups', 'server_settings.json');

    // create file if it doesn't exist already

    fs.writeFile(backupFile, json, { flag: 'w', encoding: 'utf8' }, (err) => {
        if (err) {
            console.error(err);
        }
    });
}

async function restoreServerSettings(): Promise<void> {
    const backupFile = path.join(_src_dirname, '../../backups', 'server_settings.json');
    // if file doesn't exist return
    if (!fs.existsSync(backupFile)) {
        return;
    }
    fs.readFile(backupFile, { encoding: 'utf8' }, (err, data) => {
        if (err) {
            console.error(err);
        }
        const backup = JSON.parse(data) as backupData;
        Object.keys(backup).forEach(async (key) => {
            const backupData = backup[key];
            if (backupData !== undefined) {
                const server = await GuildStuff.fromJSON(backupData).catch((err) => {
                    console.error(err);
                });
                if(server === undefined) {
                    return;
                }
                const guildId = server.guild.id;
                allServerData.set(guildId, server);
                console.log('Restored server settings for ' + server.guild.name);
            }
        });
    });
}

async function appendNewStarboardMessageId(
    guildId: Snowflake,
    messageId: Snowflake
): Promise<void> {
    const backupFile = path.join(_src_dirname, '../../backups', `${guildId}_lib_msg.txt`);

    // create file if it doesn't exist already

    fs.writeFile(backupFile, messageId + '\n', { flag: 'a', encoding: 'utf8' }, (err) => {
        if (err) {
            console.error(err);
        }
    });
}

async function isInStarboardDatabase(
    guildId: Snowflake,
    messageId: Snowflake
): Promise<boolean> {
    const backupFile = path.join(_src_dirname, '../../backups', `${guildId}_lib_msg.txt`);

    if (!fs.existsSync(backupFile)) {
        return false;
    }

    const data = fs.readFileSync(backupFile, { encoding: 'utf8' });
    const lines = data.split('\n');
    return lines.includes(messageId);
}

async function restoreStarboardMessages(): Promise<void> {
    client.guilds.cache.forEach((guild) => {
        const guildId = guild.id;
        const backupFile = path.join(
            _src_dirname,
            '../../backups',
            `${guildId}_lib_msg.txt`
        );

        if (!fs.existsSync(backupFile)) {
            return;
        }

        const data = fs.readFileSync(backupFile, { encoding: 'utf8' });
        const lines = data.split('\n');
        // reverse the array so that the newest message is first
        lines.reverse();
        starboardMessages.set(guildId, lines);

        console.log('Restored starboard messages for ' + guild.name);
    });
}

export {
    backupServerSettings,
    restoreServerSettings,
    appendNewStarboardMessageId,
    isInStarboardDatabase,
    restoreStarboardMessages
};
