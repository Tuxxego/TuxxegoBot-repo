require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

ModulesLoader = require("./botModuleLoader.js");
let modules = ModulesLoader.loadModules();
ModulesHandler = require("./botModuleHandler.js");
ModulesHandler.attachModules(modules, client);

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content === '-test') {
        message.reply('test message as proof');
	}
});

client.login(process.env.TOKEN);
