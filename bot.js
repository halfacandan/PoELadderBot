const botHelpCommand = "help";
const botAboutCommand = "about";
const lineBreak = "\n\uFEFF";

import discord, { Client, GatewayIntentBits, REST, SlashCommandBuilder, Routes, ActivityType } from 'discord.js';
import { RequireAll, GetChannelIdAsync } from './modules/helpers.js';
import { AboutThisBot, BotError, SendReplies } from './modules/messages.js';

const bot = new Client({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,    
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildExpressions,
        GatewayIntentBits.GuildMessages,    
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping
    ]
});

// Required to intercept the slash commands
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

// Define global variables
var botName;

globalThis.slashCommands = {
    [botAboutCommand]: {
        name: botAboutCommand,
        description: "Learn how to contribute to the PoE Ladder bot",
        actionAsync: async () => {

            return await AboutThisBot();
        }
    },
    [botHelpCommand]: {
        name: botHelpCommand,
        description: "Get help with using the PoE Ladder bot",
        actionAsync: async () => {

            let supportChannelId = await GetChannelIdAsync(null, "support");
            let helpCommands = Object.entries(globalThis.slashCommands).map(([key, command]) => 
                `**/${command.name}** - ${command.description}`
            );
            let helpMessage = `You can get help in the ${supportChannelId} channel${lineBreak}${lineBreak}` + helpCommands.sort().join(lineBreak);

            return helpMessage;
        }
    }
};

// Load all the slash command handlers
RequireAll('./slashcommands');

// Define Bot Behaviours
bot.on('clientReady', async () => {

    botName = bot.user.username;

    let commands = Object.entries(globalThis.slashCommands).map(([key, command]) => {
        return new SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description)
            .toJSON()
    });

    // Configure the slash commands
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.SERVER_ID),
        { 
            body: commands
        }
    );

    bot.user.setPresence({
        activities: [{ name: `Type /${botHelpCommand}`, type: ActivityType.Listening }],
        status: 'online',
    });

    console.log(`${botName} is online`);
});

bot.on('interactionCreate', async interaction => {
    
    // Define the reply
    var replies = Array();
    var reactions = null;
    var replyToPerson = true;
    var reactToMessageNumber = null;

    if(interaction.commandName == null) return;

    if(interaction.channel != null) interaction.channel.sendTyping();

    let actionResult = await globalThis.slashCommands[interaction.commandName]?.actionAsync();
    replies.push(actionResult ?? BotError());

    await SendReplies(discord, bot, interaction, replies, reactions, replyToPerson, reactToMessageNumber, true);
});

// Login to Discord as the Bot
bot.login(process.env.BOT_TOKEN); 