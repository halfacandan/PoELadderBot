import { MakeApiGetCallAsync } from '../modules/poeLadderApi.js';
import { SlashCommandConfig, UserProfile } from '../types/index.js';

// Add the name and description of this slash command to display in the Discord UI
const whoisConfig: SlashCommandConfig = {
    name: 'whois',
    description: 'Lookup a Discord user\'s PoE Ladder Profile',
    actionAsync: async () => {
        const jwtToken = process.env.API_JWT;
        const userLadderProfile = await GetUserLadderProfile(jwtToken, '@halfacandan');

        return userLadderProfile;
    }
};

globalThis.slashCommands['whois'] = whoisConfig;

export async function GetUserLadderProfile(jwtToken: string | undefined, handle: string | undefined): Promise<object | null> {
    
    if (!handle) return null;

    const endpointPath = `v1/bot/whois?handle=${handle}`;
    const profile: UserProfile = new UserProfile(await MakeApiGetCallAsync(endpointPath, jwtToken ?? null));
    
    const embeddedMessage = {
        "embed": {
            "title": `Who is ${handle}?`,
            "description": `${handle} is [${profile.poeUsername}](${profile.poeSiteUri})`,
            "fields": profile.profiles?.map(p => {
                return {
                    "name": "",
                    "value": `[${p.leagueName}](${p.poeSiteUri}) - ${p.completionPercentage}%`
                }
            })
        }
    };

    return embeddedMessage;
}
