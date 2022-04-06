"use strict";


const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { Application } = require("@fromps-bot/application");

const slashCommands = require("./slash_commands");

module.exports = class Discord extends Application.Module {
  constructor(app, { token, clientId, guildId }) {
    super(app);

    this.token = token;
    this.clientId = clientId;
    this.guildId = guildId;

    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
    });
    this.commands = new Collection();

    this.client.on("interactionCreate", async interaction => {
      this.#resolveInteraction(interaction);
    });

    this.client.once("ready", () => {
      console.log("Ready!");
    });

    this.#registerSlashCommands();
  }

  start() {
    return this.client.login(this.token);
  }

  async updateCommands() {
    const commands = [];
    for (const command of this.commands) {
      commands.push(command[1].definition);
    }

    const rest = new REST({ version: "9" }).setToken(this.token);

    return await rest.put(
      Routes.applicationGuildCommands(this.clientId, this.guildId),
      { body: commands }
    );
  }


  async #resolveInteraction(interaction) {
    // TODO: Set discord client error handling to log unhandled errors instead of crashing.
    if (!interaction.isCommand()) return;

    const command = this.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await this.app.run(
        async () => {
          if (!command.anonymous) {
            // TODO: Login with user credentials from interaction
          }

          await command.execute(interaction, this);
        }
      );
    } catch (error) {
      // TODO: REWRITE
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true
      });
    }
  }

  #registerSlashCommands() {
    for (const command in slashCommands) {
      const instance = new slashCommands[command]();
      this.commands.set(instance.name, instance);
    }
  }
};
