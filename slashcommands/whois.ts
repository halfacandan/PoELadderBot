import { MakeApiGetCallAsync } from '../modules/poeLadderApi.js';
import { SlashCommandConfig, SlashCommandVariable, UserProfile } from '../types/index.js';

// Add the name and description of this slash command to display in the Discord UI
const whoisConfig: SlashCommandConfig = {
    name: 'whois',
    description: 'Lookup a Discord user\'s PoE Ladder Profile',
    variables: [
        {
            name: 'handle',
            description: 'The user\'s Discord handle (e.g. @halfacandan)',
            type: 'user',
            required: true
        } as SlashCommandVariable
    ],
    actionAsync: async (interaction) => {

        // Lookup the Discord handle in the command variables to get the user's nickname and username
        const discordAccount = interaction.options.getUser('handle');
        const userNickname = interaction.guild.members.cache.get(discordAccount.id).nickname;

        const jwtToken = process.env.API_JWT;
        const userLadderProfile = await GetUserLadderProfile(jwtToken, discordAccount.username, userNickname);

        return userLadderProfile;
    }
};

globalThis.slashCommands['whois'] = whoisConfig;

export async function GetUserLadderProfile(jwtToken: string | undefined, handle: string | undefined, nickname: string | undefined): Promise<object | string | null> {
    
    if (!handle && !nickname) return null;

    const endpointPath = `v1/bot/whois?handle=${handle}&nickname=${nickname}`;
    const profile: UserProfile = new UserProfile(await MakeApiGetCallAsync(endpointPath, jwtToken ?? null));
    
    if(profile.handle == null && profile.displayName == null) {

        return `No profile found for ${nickname ?? handle}`;
    }

    const embeddedMessage = {
        "embed": {
            "title": `Who is ${nickname ?? handle}?`,
            "description": `${nickname ?? handle} is [${profile.poeUsername}](${profile.poeSiteUri})`,
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
