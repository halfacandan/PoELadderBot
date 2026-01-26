const botHelpCommand = "help";
const botAboutCommand = "about";
const lineBreak = "\n\uFEFF";

const discord = require('discord.js');
const helpers = require('./modules/helpers.js');
const messages = require('./modules/messages.js');

const bot = new discord.Client({
    intents: [
        discord.GatewayIntentBits.MessageContent,
        discord.GatewayIntentBits.DirectMessages,
        discord.GatewayIntentBits.DirectMessageReactions,
        discord.GatewayIntentBits.DirectMessageTyping,    
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildExpressions,
        discord.GatewayIntentBits.GuildMessages,    
        discord.GatewayIntentBits.GuildMessageReactions,
        discord.GatewayIntentBits.GuildMessageTyping
    ]
});

// Required to intercept the slash commands
const rest = new discord.REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

// Define global variables
var botName;
var jwtToken = process.env.API_JWT;

// Connect to the GoW API
const poeLadderApi = require('./modules/poeLadderApi.js');

// Define Bot Behaviours
bot.on('clientReady', async () => {

    botName = bot.user.username;

    const commands = [
        new discord.SlashCommandBuilder()
            .setName(botAboutCommand)
            .setDescription('learn how to contribute to the PoE Ladder bot')
            .toJSON(),
        new discord.SlashCommandBuilder()
            .setName(botHelpCommand)
            .setDescription('Get help with using the PoE Ladder bot')
            .toJSON(),
        new discord.SlashCommandBuilder()
            .setName('ladders')
            .setDescription('List the monitored PoE Ladder leagues')
            .toJSON()
    ];

    // Configure the slash commands
    await rest.put(
        discord.Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.SERVER_ID),
        { body: commands },
    );

    bot.user.setPresence({
        activities: [{ name: `Type /${botHelpCommand}`, type: discord.ActivityType.Listening }],
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

    switch (interaction.commandName) {
        case `${botAboutCommand}`:

            if(interaction.channel != null) interaction.channel.sendTyping();

            replies.push(await messages.AboutThisBot());
            break;

        case `${botHelpCommand}`:

            if(interaction.channel != null) interaction.channel.sendTyping();
            
            let supportChannelId = await helpers.GetChannelIdAsync(interaction.guild, "support");
            let helpCommands = await messages.ListBotCommands(botAboutCommand);
            let helpMessage = `You can get help in the ${supportChannelId} channel${lineBreak}${lineBreak}` + helpCommands.sort().join(lineBreak);
            replies.push(helpMessage);
            break;

        case 'ladders':

            if(interaction.channel != null) interaction.channel.sendTyping();

            let ladders = await poeLadderApi.GetIndexedLadders(jwtToken);
            if(ladders?.length < 1){

                replies.push(messages.BotError());

            } else {

                replies.push(await messages.ListLadders(ladders))
            }
            break;

        default:
            // Do nothing
    }

    await messages.SendReplies(discord, bot, interaction, replies, reactions, replyToPerson, reactToMessageNumber, true);
});

// Login to Discord as the Bot
bot.login(process.env.BOT_TOKEN); 