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
        this.profiles = json.profiles?.map((profile: any)=> new UserLadderProfile(profile, poeUsernameForUri)) ?? null;
    }

    private PoeSiteUri(poeUsernameForUri: string|null): string|null {

        if(poeUsernameForUri == null) return null;

        return `https://www.pathofexile.com/account/view-profile/${poeUsernameForUri}`;
    }
}

export class UserLadderProfile {

    public leagueName: string|null;
    public rank: number;
    public completionPercentage: number;
    public poeSiteUri: string|null;

    public constructor(json:any, poeUsernameForUri: string|null) {

        this.leagueName = json.leagueName ?? null;
        this.rank = json.rank ?? 0;
        this.completionPercentage = json.completionPercentage ?? 0;
        this.poeSiteUri = this.PoeLadderUri(poeUsernameForUri, json.ladderIdentifier ?? null, json.isPoe2 ?? false);
    }

    private PoeLadderUri(poeUsernameForUri: string|null, ladderIdentifier: string|null, isPoe2: boolean): string|null {

        if(ladderIdentifier == null) return null;

        return `https://poeladder.com/profile?user=${poeUsernameForUri}&ladderIdentifier=${ladderIdentifier}&isPoe2=${isPoe2}`;
    }
}
