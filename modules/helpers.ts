import fs from 'fs/promises';
import path from 'path';
import { Guild } from 'discord.js';

export async function GetChannelIdAsync(guild: Guild | null, channelName: string | null): Promise<string> {
    if (guild == null || channelName == null) return "**#" + channelName + "**";

    const channel = guild.channels.cache.find((ch: any) => 'name' in ch && ch.name === channelName);

    return (typeof channel === "undefined" ? "**#" + channelName + "**" : channel.toString());
}

export async function RequireAll(dir: string): Promise<void> {
    const absDir = path.resolve(dir);
    for (const f of await fs.readdir(absDir)) {
        const full = path.join(absDir, f);
        const st = await fs.stat(full);
        if (st.isDirectory()) {
            await RequireAll(full);
        } else {
            // Only load .js files in production/compiled mode
            if (f.endsWith('.js')) {
                const importPath = new URL(`file://${full}`).href;
                const imported = await import(importPath);
                // Expose all exported functions globally
                Object.assign(globalThis, imported);
            }
        }
    }
}
