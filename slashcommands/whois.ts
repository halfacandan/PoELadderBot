import { GetCustomAppEmojisAsync } from '../modules/messages.js';
import { MakeApiGetCallAsync } from '../modules/poeLadderApi.js';
import { ParseLadderDataIntoFields } from './ladders.js';
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
        // Try to get the latest nickname data
        interaction.guild.members.fetch();
        const userGuildAccount = await interaction.guild.members.cache.get(discordAccount.id);
        console.log(userGuildAccount);
        const userNickname = userGuildAccount.nickname;

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
    
    if(profile.handle == null && profile.displayName == null || profile.poeUsername == null || profile.poeSiteUri == null) {

        return `No profile found for ${nickname ?? handle}`;
    }

    const appEmojis = await GetCustomAppEmojisAsync();

    const userLadders = await ParseLadderDataIntoFields(profile.profiles);
    
    const lineBreak = "\n\uFEFF\u2001 ";
    const platformIcon = profile.xbox ? appEmojis["xbox"] : profile.playstation ? appEmojis["playstation"] : "";
    let message = `${nickname ?? handle} is [${profile.poeUsername}](${profile.poeSiteUri})\u00A0\u00A0${platformIcon}`;

    if(profile.youtube != null) {

        let youTubeAccount = profile.youtube.slice(0, 1) == "@" ? profile.youtube : nickname ?? handle;
        let youTubeLink = (profile.youtube.slice(0, 1) == "@" ? "https://www.youtube.com/" : "https://www.youtube.com/channel/") + profile.youtube;
        message += `${lineBreak}${appEmojis["youtube"]}\u00A0\u00A0[${youTubeAccount}](${youTubeLink})`;
    }
    if(profile.twitch != null) {

        let twitchAccount = profile.twitch ?? nickname ?? handle;
        let twitchLink = "https://www.twitch.tv/" + profile.twitch;
        message += `${lineBreak}${appEmojis["twitch"]}\u00A0\u00A0[${twitchAccount}](${twitchLink})`;
    }

    const embeddedMessage = {
        "embed": {
            "title": `Who is ${nickname ?? handle}?`,
            "description": message,
            "fields": userLadders
        }
    };

    return embeddedMessage;
}
