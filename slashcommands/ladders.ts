import { GetCustomAppEmojisAsync } from '../modules/messages.js';
import { MakeApiGetCallAsync } from '../modules/poeLadderApi.js';
import { SlashCommandConfig, Ladder, UserLadderProfile } from '../types/index.js';

// Add the name and description of this slash command to display in the Discord UI
const laddersConfig: SlashCommandConfig = {
    name: 'ladders',
    description: 'List the monitored PoE Ladder leagues',
    actionAsync: async () => {
        const jwtToken = process.env.API_JWT;
        const ladders = await GetIndexedLadders(jwtToken);

        return ladders && ladders.length > 0 ? await ListLadders(ladders) : null;
    }
};

globalThis.slashCommands['ladders'] = laddersConfig;

export async function ParseLadderDataIntoFields(ladders: Ladder[] | UserLadderProfile[] | null | undefined): Promise<any|null> {

    if (!ladders || ladders.length == 0) return null;

    const appEmojis = await GetCustomAppEmojisAsync();

    const fields = [
        PrintLadderGroup(
            `${appEmojis["poe1"]}  Path of Exile 1 (Events)`,
            ladders.filter(l => !l.isPoe2 && l.registerable && l.event)
        ),
        PrintLadderGroup(
            `${appEmojis["poe1"]}  Path of Exile 1`,
            ladders.filter(l => !l.isPoe2 && l.registerable && !l.hardcore && !l.event && !l.private && !l.ruthless && !l.trade)
        ),
        PrintLadderGroup(
            `${appEmojis["poe1"]}  Path of Exile 1 (Hardcore)`,
            ladders.filter(l => !l.isPoe2 && l.registerable && l.hardcore && !l.event && !l.private && !l.ruthless && !l.trade)
        ),
        PrintLadderGroup(
            `${appEmojis["poe1"]}  Path of Exile 1 (Trade)`,
            ladders.filter(l => !l.isPoe2 && l.registerable && !l.hardcore && !l.event && !l.private && !l.ruthless && l.trade)
        ),
        PrintLadderGroup(
            `${appEmojis["poe1"]}  Path of Exile 1 (Ruthless)`,
            ladders.filter(l => !l.isPoe2 && l.registerable && l.ruthless)
        ),
        PrintLadderGroup(
            `${appEmojis["poe1"]}  Path of Exile 1 (Private Leagues)`,
            ladders.filter(l => !l.isPoe2 && l.registerable && l.private)
        ),
        PrintLadderGroup(
            `${appEmojis["poe2"]}  Path of Exile 2`,
            ladders.filter(l => l.isPoe2 && l.registerable)
        )
    ];

    return fields.filter((l: any) => l != null);
}

async function GetIndexedLadders(jwtToken: string | undefined): Promise<Ladder[] | undefined> {
    const endpointPath = "v1/ladders?indexed=1";
    const json = await MakeApiGetCallAsync(endpointPath, jwtToken ?? null);
    return json;
}

async function ListLadders(ladders: Ladder[] | undefined): Promise<any> {

    const fields = await ParseLadderDataIntoFields(ladders);

    const embeddedMessage = {
        "embed": {
            "title": ":ladder:  Active PoE Ladders",
            "description": `PoE Ladder currently tracks these leagues:`,
            "fields": fields
        }
    };

    return embeddedMessage;
}

function PrintLadderGroup(title: string, ladders: Ladder[]): any {
    
    if (ladders?.length == 0) return null;

    const nonBreakingSpace = "\uFEFF\u2001";

    return {
        "name": title,
        "value": ladders
            .sort((a, b) => (a.orderBy ?? 0) - (b.orderBy ?? 0))
            .map((ladder) => `${nonBreakingSpace}${(ladder.userRanking == null ? ' * ' : `${ladder.userRanking} in `)}[${ladder.name}](${process.env.SITE_BASE}ladder?ladderIdentifier=${ladder.identifier}&isPoe2=` + (ladder.isPoe2 ?? false).toString() + (ladder.user == null ? '' : `&user=${ladder.user}`) + ")")
            .join("\n")
    };
}
