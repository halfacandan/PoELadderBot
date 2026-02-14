export async function GetChannelIdAsync(guild, channelName) {

    if (guild == null || channelName == null) return "**#" + channelName + "**";

    let channel = await guild.channels.cache.find(channel => channel.name === channelName);

    return (typeof channel === "undefined" ? "**#" + channelName + "**" : channel.toString());
}

import fs from 'fs/promises';
import path from 'path';

export async function RequireAll(dir) {

    for (const f of await fs.readdir(dir)) {

        const full = path.join(dir, f);
        const st = await fs.stat(full);
        if (st.isDirectory()) {
            importAll(full);
        } else {
            if (f.endsWith('.mjs') || f.endsWith('.js')) {
                // Convert backslashes to forward slashes and add ./ prefix
                const importPath = '../' + full.replace(/\\/g, '/');
                const imported = await import(importPath);
                // Expose all exported functions globally
                Object.assign(globalThis, imported);
            }
        }
    }
}