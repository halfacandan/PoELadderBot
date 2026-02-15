import { UserLadderProfile } from '../types/index.js';

export class UserProfile {
    public handle: string|null;
    public displayName: string|null;
    public poeUsername: string|null;
    public youtube: string|null;
    public twitch: string|null;
    public xbox: boolean;
    public playstation: boolean;
    public poeSiteUri: string|null;
    public profiles: UserLadderProfile[]|null;
    
    public constructor(json:any) {
        
        this.handle = json.handle ?? null;
        this.displayName = json.displayName ?? null;
        this.poeUsername = json.poeUsername ?? null;
        
        this.youtube = json.youtube ?? null;
        this.twitch = json.twitch ?? null;
        this.xbox = json.xbox ?? false;
        this.playstation = json.playstation ?? false;

        const poeUsernameForUri = json.poeUsername?.replace(/#(\d{4})$/, '-$1');
        this.poeSiteUri = this.PoeSiteUri(poeUsernameForUri);

        const maxRankStringLength = json.profiles == null ? 0 : Math.max(...json.profiles?.map((profile: any) => profile.rank ?? 0)).toString().length;
        this.profiles = json.profiles?.map((profile: any)=> new UserLadderProfile(profile, poeUsernameForUri, maxRankStringLength)) ?? null;
    }

    private PoeSiteUri(poeUsernameForUri: string|null): string|null {

        if(poeUsernameForUri == null) return null;

        return `https://www.pathofexile.com/account/view-profile/${poeUsernameForUri}`;
    }
}
