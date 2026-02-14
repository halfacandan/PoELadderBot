import { Client, AttachmentBuilder } from 'discord.js';
import { text2png } from '@thatiemsz/text2png';

const LineBreak = "\n\uFEFF";

export function BotError(): string {
    return "**\\*Blip\\*** *\\*Blip\\** ***\\*Blip\\**** End of Cheese Error";
}

export async function AboutThisBot(): Promise<any> {
    const BotAuthorDiscordId = '342266718334353408';

    const embeddedMessage = {
        "embed": {
            "title": ":robot:  PoE Ladder Bot",
            "description": `The PoE Ladder Bot was created by <@!${BotAuthorDiscordId}>. You can submit pull requests to the public git repo if you'd like to contribute.${LineBreak}`,
            "fields": [
                {
                    "name": ":computer:  Git Repo",
                    "value": " * [View the PoE Ladder Bot's node.js code](https://github.com/halfacandan/PoELadderBot)"
                }
            ]
        }
    };

    return embeddedMessage;
}

export async function ReactToMessageAsync(bot: Client, message: any, reactions: string | string[]): Promise<void> {
    if (bot == null || message == null || reactions == null) return;

    const reactionsArray = typeof reactions === "string" ? [reactions] : reactions;

    let msg = message;
    if (message.constructor.name != "InteractionResponse") {
        msg = await message.channel.messages.fetch(message.id);
    }

    for (const reaction of reactionsArray) {
        const emojiCode = await GetServerEmojiCodeAsync(bot, reaction);
        if (emojiCode != null) {
            await msg.react(emojiCode);
        }
    }
}

export async function GetServerEmojiCodeAsync(bot: Client, emojiShortcode: string): Promise<string | null> {
    // https://discordjs.guide/popular-topics/reactions.html#custom-emojis
    if (emojiShortcode.match(/:[^:]+:$/g) != null && bot != null) {
        const emoji = bot.emojis.cache.find(em => em.name == emojiShortcode.replace(/:|:$/g, ''));
        if (typeof emoji !== "undefined") {
            // This is a custom emoji
            return emoji.id;
        } else {
            // This is an invalid custom emoji
            return null;
        }
    } else {
        // This is a unicode emoji
        return emojiShortcode;
    }
}

export async function GetCustomAppEmojisAsync(): Promise<{ [key: string]: string }> {
    const apiPath = `https://discord.com/api/v10/applications/${process.env.CLIENT_ID}/emojis`;
    const emojiQuery = await fetch(apiPath, { headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` } });
    const emojiList = await emojiQuery.json() as any;

    const emojis: { [key: string]: string } = {};
    emojiList?.items?.map((e: any) => emojis[e.name] = `<:${e.name}:${e.id}>`);

    return emojis;
}

export async function SendReplies(
    bot: Client,
    userMessage: any,
    replies: any[],
    reactions: string | string[] | null = null,
    replyToPerson: boolean = false,
    reactToMessageNumber: number | null = null,
    isInteraction: boolean = false
): Promise<void> {
    if (replies != null) {
        let message: any;
        let finalReplyMessage: any;
        let reacted = false;
        const messages: any[] = [];

        for (let i = 0; i < replies.length; i++) {
            if (!isInteraction && (replyToPerson || userMessage == null || typeof userMessage.channel === "undefined" || userMessage.channel == null)) {
                if (typeof replies[i] === "string") {
                    message = "\n" + replies[i];
                    messages.push(await userMessage.reply(replies[i], { split: true }));
                } else {
                    message = await ParseEmbeddedMessage(replies[i]);
                    messages.push(await userMessage.reply({ embeds: [message.embed] }));
                }
            } else {
                if (typeof replies[i] === "string") {
                    if (isInteraction) {
                        if (i == 0) {
                            await userMessage.reply(replies[i], { split: true });
                        } else {
                            await userMessage.followUp(replies[i], { split: true });
                        }
                        messages.push(await userMessage.fetchReply());
                    } else {
                        messages.push(await userMessage.channel.send(replies[i], { split: true }));
                    }
                } else {
                    let messageFormatted: any;
                    if (typeof replies[i].embed === "undefined") {
                        messageFormatted = {
                            "content": replies[i].content,
                            "embeds": [{
                                "image": {
                                    "url": replies[i].file
                                }
                            }]
                        };
                    } else {
                        message = await ParseEmbeddedMessage(replies[i]);
                        if (message.files != null) {
                            messageFormatted = message;
                        } else {
                            messageFormatted = {
                                embeds: [message.embed]
                            };
                        }
                    }
                    if (isInteraction) {
                        if (i == 0) {
                            await userMessage.reply(messageFormatted);
                        } else {
                            await userMessage.followUp(messageFormatted);
                        }
                        messages.push(await userMessage.fetchReply());
                    } else {
                        messages.push(await userMessage.channel.send(messageFormatted));
                    }
                }
            }

            finalReplyMessage = messages[i];

            if (reactToMessageNumber == i) {
                const replyMessage = Array.isArray(finalReplyMessage) ? finalReplyMessage[0] : finalReplyMessage;
                await ReactToMessageAsync(bot, replyMessage, reactions as any);
                reacted = true;
            }
        }
        if (reactions != null && reacted != true) {
            const replyMessage = Array.isArray(finalReplyMessage) ? finalReplyMessage[0] : finalReplyMessage;
            await ReactToMessageAsync(bot, replyMessage, reactions as any);
        }
    }
}

function FixBulletPoints(text: string): string {
    const bulletOne = "\uFEFF\u2001\u2022 ";
    const bulletTwo = "\uFEFF\u2001\u2001\u2043 ";

    // Unordered lists
    text = text.replace(/ \* /g, bulletOne).replace(/ \*\* /g, bulletTwo);
    // Ordered lists
    text = text.replace(/ ([0-9]+(?:\.|\)) )/g, "\uFEFF\u2001$1").replace(/ ([0-9]+\.[0-9]+(?:\.|\)) )/g, "\uFEFF\u2001\u2001$1");

    // Fix any incorrectly-escaped \uFEFF stringification issues
    text = text.replace("\\uFEFF", "\uFEFF");

    return text;
}

async function ParseEmbeddedMessage(embeddedMessage: any): Promise<any> {
    let attachment: AttachmentBuilder | null = null;

    if (typeof embeddedMessage.embed.type === "undefined" || embeddedMessage.embed.type == null) {
        embeddedMessage.embed.type = "rich";
    }

    if (typeof embeddedMessage.embed.description !== "undefined" && embeddedMessage.embed.description != null) {
        embeddedMessage.embed.description = FixBulletPoints(embeddedMessage.embed.description);
    }

    if (typeof embeddedMessage.embed.fields !== "undefined" && embeddedMessage.embed.fields != null) {
        for (let i = 0; i < embeddedMessage.embed.fields.length; i++) {
            if (typeof embeddedMessage.embed.fields[i].value !== "undefined") {
                const fixedFieldValue = FixBulletPoints(embeddedMessage.embed.fields[i].value);
                embeddedMessage.embed.fields[i].value = fixedFieldValue;
            }
        }
    }

    if ((typeof embeddedMessage.embed.image === "undefined" || embeddedMessage.embed.image == null)
        && typeof embeddedMessage.embed.table !== "undefined" && embeddedMessage.embed.table != null) {

        const imageStream = text2png(embeddedMessage.embed.table, {
            font: '16px Courier',
            color: 'white',
            bgColor: '#2f3136', // Discord Dark Gray
            lineSpacing: 0,
            padding: 0,
            output: 'buffer'
        });

        let imageName: string;
        if (typeof embeddedMessage.embed.title !== "undefined" && embeddedMessage.embed.title != null) {
            imageName = embeddedMessage.embed.title.trim().toLowerCase().replace(/\s/g, "_").replace(/[^a-zA-Z0-9]/ig, "");
        } else {
            imageName = Math.random().toString(36).replace(/[^a-z]+/ig, '').substr(0, 5);
        }

        attachment = new AttachmentBuilder(imageStream, { name: `${imageName}.png` });
        if (attachment != null) {
            embeddedMessage.embed.image = {
                "url": `attachment://${imageName}.png`
            };
        }
    }

    if (attachment == null) {
        return embeddedMessage;
    } else {
        const message = {
            "embeds": [embeddedMessage.embed],
            "files": [attachment]
        };
        return message;
    }
}
