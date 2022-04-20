"use strict";


const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const slashCommands = require("./slash_commands");

module.exports = class Discord {
  constructor({ app }) {
    this.#app = app;

    const { token, clientId, guildId } = this.#app.config.get("discord");

    this.#token = token;
    this.#clientId = clientId;
    this.#guildId = guildId;

    this.#client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
    });
    this.#commands = new Collection();

    this.#client.on("interactionCreate", async interaction => {
      this.#resolveInteraction(interaction);
    });

    this.#client.once("ready", () => {
      console.log("Ready!");
    });

    this.#registerSlashCommands();
  }

  get app() {
    return this.#app;
  }

  start() {
    return this.#client.login(this.#token);
  }

  async updateCommands() {
    const commands = [];
    for (const command of this.#commands) {
      commands.push(command[1].definition);
    }

    const rest = new REST({ version: "9" }).setToken(this.#token);

    return await rest.put(
      Routes.applicationGuildCommands(this.#clientId, this.#guildId),
      { body: commands }
    );
  }


  async #resolveInteraction(interaction) {
    // TODO: Set discord client error handling to log unhandled errors instead of crashing.
    if (!interaction.isCommand()) return;

    const command = this.#commands.get(interaction.commandName);
    if (!command) return;

    try {
      await this.#app.context.run(
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
      const instance = new slashCommands[command](this);
      this.#commands.set(instance.name, instance);
    }
  }

  #app;
  #client;
  #commands;
  #token;
  #clientId;
  #guildId;
};
