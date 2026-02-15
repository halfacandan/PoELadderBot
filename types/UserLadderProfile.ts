
import { Ladder } from '../types/index.js';

export class UserLadderProfile implements Ladder {

    public completionPercentage: number;

    // Ladder properties
    public name: string;
    public identifier: string;
    public isPoe2?: boolean;
    public registerable: boolean;
    public event?: boolean;
    public hardcore?: boolean;
    public private?: boolean;
    public ruthless?: boolean;
    public trade?: boolean;
    public orderBy?: number;
    public user?: string|null;
    public userRanking?: string|null;

    public constructor(json:any, poeUsernameForUri: string|null, maxRankStringLength: number) {

        this.name = json.name ?? null;
        this.identifier = json.identifier ?? null;
        this.isPoe2 = json.isPoe2 ?? false;
        this.registerable = json.registerable ?? false;
        this.event = json.event ?? false;
        this.hardcore = json.hardcore ?? false;
        this.private = json.private ?? false;
        this.ruthless = json.ruthless ?? false;
        this.trade = json.trade ?? false;
        this.orderBy = json.orderBy ?? 999; 
        this.user = poeUsernameForUri ?? null;
        this.userRanking = this.PadRank(json.rank, maxRankStringLength);
        this.completionPercentage = json.completionPercentage ?? 0;
    }

    private PadRank(rank: number, maxRankStringLength: number): string {

        const halfWidthNonBreakingSpace = "\u00A0";

        const numberOfHalfWidthCharactersInString = (rank.toString().match(new RegExp("1", "g")) || []).length
        const numberOfPaddingCharactersNeeded = (maxRankStringLength - rank.toString().length) * 2 + numberOfHalfWidthCharactersInString;

        return halfWidthNonBreakingSpace. repeat(numberOfPaddingCharactersNeeded) + this.GetOrdinalWithSuffix(rank);
    }

    private GetOrdinalWithSuffix(i: number): string {

        const halfWidthNonBreakingSpace = "\u00A0";

        let j = i % 10,
            k = i % 100;
        if (j === 1 && k !== 11) {
            return halfWidthNonBreakingSpace + i + "st";
        }
        if (j === 2 && k !== 12) {
            return i + "nd";
        }
        if (j === 3 && k !== 13) {
            return i + "rd";
        }
        return halfWidthNonBreakingSpace + i + "th";
    }
}
