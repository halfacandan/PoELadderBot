import { Client, GatewayIntentBits, REST, SlashCommandBuilder, Routes, ActivityType } from 'discord.js';
import { RequireAll, GetChannelIdAsync } from './modules/helpers.js';
import { AboutThisBot, BotError, SendReplies } from './modules/messages.js';
import { SlashCommandConfig } from './types/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botHelpCommand = "help";
const botAboutCommand = "about";
const lineBreak = "\n\uFEFF";

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
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);

// Define global variables
let botName: string;

const aboutCommand: SlashCommandConfig = {

    name: botAboutCommand,
    description: "Learn how to contribute to the PoE Ladder bot",
    actionAsync: async () => {
        return await AboutThisBot();
    }
};

const helpCommand: SlashCommandConfig = {
    name: botHelpCommand,
    description: "Get help with using the PoE Ladder bot",
    actionAsync: async () => {

        const supportChannelId = await GetChannelIdAsync(null, "support");
        const helpCommands = 
            Object.entries(globalThis.slashCommands)
                .filter(([key]) => key !== botHelpCommand)
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                .map(([key, command]) => {
                    return `**/${command.name}** - ${command.description}`
                });

        const helpMessage = `You can get help in the ${supportChannelId} channel${lineBreak}${lineBreak}` + helpCommands.sort().join(lineBreak);

        return helpMessage;
    }
};

globalThis.slashCommands = {
    [botAboutCommand]: aboutCommand,
    [botHelpCommand]: helpCommand
};

// Load all the slash command handlers
await RequireAll(`${__dirname}/slashcommands`);

// Define Bot Behaviours
bot.on('clientReady', async () => {
    botName = bot.user!.username;

    const commands = 
        Object.entries(globalThis.slashCommands)
            .map(([key, command]) => {
/*
                if(command.variables != null && command.variables!.length > 0) {
                    return new SlashCommandBuilder()
                        .setName(command.name)
                        .setDescription(command.description)
                        .addStringOption(option => 
                            option.setName(command.variables?[0].name ?? 'var')
                                .setDescription(command.variables?[0].description ?? 'desc')
                                .setRequired(command.variables?[0].required) // Makes this field mandatory
                        )
                        .toJSON();

                }
*/
                return new SlashCommandBuilder()
                    .setName(command.name)
                    .setDescription(command.description)
                    .toJSON();
            });

    // Configure the slash commands
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.SERVER_ID!),
        { 
            body: commands
        }
    );

    bot.user!.setPresence({
        activities: [{ name: `Type /${botHelpCommand}`, type: ActivityType.Listening }],
        status: 'online',
    });

    console.log(`${botName} is online`);
});

bot.on('interactionCreate', async (interaction: any) => {
    if (!interaction.isCommand()) return;
    
    // Define the reply
    const replies: any[] = [];
    
    if(interaction.commandName == null) return;

    const actionResult = await globalThis.slashCommands[interaction.commandName]?.actionAsync();
    replies.push(actionResult ?? BotError());

    await SendReplies(bot, interaction, replies, null, false, null, true);
});

// Login to Discord as the Bot
bot.login(process.env.BOT_TOKEN);
