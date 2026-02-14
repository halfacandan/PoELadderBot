import { GetCustomAppEmojisAsync } from '../modules/messages.js';
import { MakeApiGetCallAsync } from '../modules/poeLadderApi.js';

// Add the name and description of this slash command to display in the Discord UI
globalThis.slashCommands['ladders'] = {
    name: 'ladders',
    description: 'List the monitored PoE Ladder leagues',
    actionAsync: async () => {

        let jwtToken = process.env.API_JWT;
        let ladders = await GetIndexedLadders(jwtToken);

        return ladders?.length > 0 ? await ListLadders(ladders) : null;
    }
};

export async function GetIndexedLadders(jwtToken) {

    const endpointPath = "v1/ladders?indexed=1";
    let json = await MakeApiGetCallAsync(endpointPath, jwtToken);
    return json;
}

export async function ListLadders(ladders) {

    if (ladders?.length == 0) return null;

    let appEmojis = await GetCustomAppEmojisAsync();

    let fields = [
        PrintLadderGroup(
            `${appEmojis["poe1"]}  Path of Exile 1 (Events)`,
            ladders.filter(l => !l.isPoe2 && l.registerable && l.event
            )
        ),
        PrintLadderGroup(
            `${appEmojis["poe1"]}  Path of Exile 1`,
            ladders.filter(l => !l.isPoe2 && l.registerable && !l.hardcore && !l.event && !l.private && !l.ruthless && !l.trade
            )
        ),
        PrintLadderGroup(
            `${appEmojis["poe1"]}  Path of Exile 1 (Hardcore)`,
            ladders.filter(l => !l.isPoe2 && l.registerable && l.hardcore && !l.event && !l.private && !l.ruthless && !l.trade
            )
        ),
        PrintLadderGroup(
            `${appEmojis["poe1"]}  Path of Exile 1 (Trade)`,
            ladders.filter(l => !l.isPoe2 && l.registerable && !l.hardcore && !l.event && !l.private && !l.ruthless && l.trade
            )
        ),
        PrintLadderGroup(
            `${appEmojis["poe1"]}  Path of Exile 1 (Ruthless)`,
            ladders.filter(l => !l.isPoe2 && l.registerable && l.ruthless
            )
        ),
        PrintLadderGroup(
            `${appEmojis["poe1"]}  Path of Exile 1 (Private Leagues)`,
            ladders.filter(l => !l.isPoe2 && l.registerable && l.private
            )
        ),
        PrintLadderGroup(
            `${appEmojis["poe2"]}  Path of Exile 2`,
            ladders.filter(l => l.isPoe2 && l.registerable
            )
        )
    ];

    let embeddedMessage = {
        "embed": {
            "title": ":ladder:  Active PoE Ladders",
            "description": `PoE Ladder currently tracks these leagues:`,
            "fields": fields.filter(l => l != null)
        }
    };

    return embeddedMessage;
}

function PrintLadderGroup(title, ladders) {

    if (ladders?.length == 0) return null;

    return {
        "name": title,
        "value": ladders
            .sort((a, b) => (a.OrderBy ?? 0) - (b.OrderBy ?? 0))
            .map((ladder) => ` * [${ladder.name}](${process.env.SITE_BASE}ladder?ladderIdentifier=${ladder.identifier}&isPoe2=` + (ladder.isPoe2 ?? false).toString() + ")")
            .join("\n")
    };
}
