const { Client, IntentsBitField, Collection, REST, Routes } = require('discord.js');
const { BotData } = require("../data/Bot");
const fs = require("fs");
const path = require('path');
const { checkAndUpdateTime } = require('../utils/uptime');
module.exports = class Bot {
  constructor() {
    this.client = new Client({
      intents: [
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.Guilds,
      ]
    });
    this.client.commands = new Collection();
    this.commands = [];
    this.client.emoji = {
      "success": "<a:Onaylamak:1147484560339243049>",
      "error": "<a:ReddetmekGif:1147484622456897556>",
      "online": "<a:yesil_nokta:1121848910701412444>",
      "offline": "<a:uptime_red:1121853335591465020>",
      "link": "<:Link:1233498847800721490>",
      "bot": "<:bot:1122136788874580058>"
    }

  }




  async init() {
    this.StartBot();
    this.LoadCommands();
    this.LoadEvents();
    this.client.on("ready", async () => {
      this.PostCommandsToAPI();
    })
    this.UptimeLinks();
  }
  async StartBot() {
    this.client.on('ready', () => {
      console.log(`Bot ${this.client.user.tag} olarak giriş yaptı!`);
    });

    await this.client.login(BotData.token);
  }
  async LoadCommands() {
    const foldersPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
          this.client.commands.set(command.data.name, command);
          this.commands.push(command.data.toJSON());
        } else {
          console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
      }
    }
  }
  async PostCommandsToAPI() {
    const rest = new REST().setToken(BotData.token);

    (async () => {
      try {
        console.log(`Started refreshing ${this.commands.length} application (/) commands.`);

        const data = await rest.put(
          Routes.applicationCommands(BotData.clientID),
          { body: this.commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
      } catch (error) {
        console.error(error);
      }
    })();
  }
  async LoadEvents() {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);
      this.client.on(event.name, (...args) => event.execute(...args));
    }
  }
  async UptimeLinks() {
    setInterval(checkAndUpdateTime, 120000);
  }
}