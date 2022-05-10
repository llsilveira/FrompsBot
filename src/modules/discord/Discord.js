"use strict";


const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const slashCommands = require("./slash_commands");
const BaseModule = require("@frompsbot/modules/BaseModule");

const { AccountProvider } = require("@frompsbot/common/constants");

module.exports = class Discord extends BaseModule {
  constructor({ app }) {
    super({ app });
    const { token, clientId, guildId } = this.app.config.get("discord");

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

  async getDiscordId(user) {
    const provider =
      await this.app.user.getProvider(user, AccountProvider.DISCORD);
    return provider?.providerId;
  }

  async getGuild(guildId) {
    const guild = this.#client.guilds.resolve(guildId);
    if (!guild.available) {
      await guild.fetch();
    }
    return guild;
  }

  async getMainGuild() {
    return await this.getGuild(this.#guildId);
  }

  async getMemberFromId(userDiscordId) {
    return (await this.getMainGuild()).members.resolve(userDiscordId);
  }

  async getMemberFromUser(user) {
    const id = await this.getDiscordId(user);
    return await this.getMemberFromId(id);
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

    await this.app.context.run(
      async () => {
        try {
          if (!command.anonymous) {
            await this.app.auth.login(AccountProvider.DISCORD, interaction.user.id);
          }
          await command.execute(interaction, this);
        } catch (e) {
          if (e instanceof Error) {
            interaction.reply({
              content: "Você deve registrar-se para usar este comando.",
              ephemeral: true
            });
          }
        }
      }
    );
  }

  #registerSlashCommands() {
    for (const command in slashCommands) {
      const instance = new slashCommands[command](this);
      this.#commands.set(instance.name, instance);
    }
  }

  #client;
  #commands;
  #token;
  #clientId;
  #guildId;
};
