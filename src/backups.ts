// store server settings in sql database

import { Collection, Snowflake } from 'discord.js';
import path from 'path';
import { GuildStuff, GuildStuffBackup } from './custom-classes/server.js';
import { allServerData, _src_dirname } from './global-stuff.js';

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
        Object.keys(backup).forEach((key) => {
            const backupData = backup[key];
            if (backupData !== undefined) {
                const server = GuildStuff.fromJSON(backupData);
                const guildId = server.guild.id;
                allServerData.set(guildId, server);
                console.log('Restored server settings for ' + server.guild.name);
            }
        });
    });
}

export { backupServerSettings, restoreServerSettings };
