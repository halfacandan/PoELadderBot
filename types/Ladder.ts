export interface Ladder {
    name: string;
    identifier: string;
    isPoe2?: boolean;
    registerable: boolean;
    event?: boolean;
    hardcore?: boolean;
    private?: boolean;
    ruthless?: boolean;
    trade?: boolean;
    orderBy?: number;
    user?: string|null;
    userRanking?: string|null;
}
