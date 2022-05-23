"use strict";


const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const slashCommands = require("./slash_commands");
const BaseModule = require("@frompsbot/modules/BaseModule");

const { AccountProvider } = require("@frompsbot/common/constants");
const {
  structuredClone,
  userErrorMessage
} = require("@frompsbot/common/helpers");

module.exports = class Discord extends BaseModule {
  constructor({ app }) {
    super({ app });
    const { token, clientId, guilds } = this.app.config.get("discord");

    this.#token = token;
    this.#clientId = clientId;

    this.#guilds = {};
    for (const guild of guilds) {
      this.#guilds[guild.name] = structuredClone(guild);
      if (guild.main) {
        this.#mainGuild = guild.name;
      }
    }

    if (!this.#mainGuild) {
      // TODO: Change
      throw new Error("You must set one guild as the 'main' guild.");
    }

    if (!this.#guilds[this.#mainGuild]?.inviteUrl) {
      // TODO: Change
      throw new Error("The main guild must have an 'inviteUrl'.");
    }

    this.#client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
    });
    this.#commands = new Collection();

    this.#client.on("interactionCreate", async interaction => {
      this.#resolveInteraction(interaction);
    });

    this.#client.once("ready", () => {
      // TODO: load guilds
      this.logger.info("Bot is ready!");
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
    return await this.getGuild(this.#guilds[this.#mainGuild].id);
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

    for (const guild in this.#guilds) {
      await rest.put(
        Routes.applicationGuildCommands(this.#clientId, this.#guilds[guild].id),
        { body: commands }
      );
    }
  }


  async #resolveInteraction(interaction) {
    // TODO: Set discord client error handling to log unhandled errors instead of crashing.
    if (!interaction.isCommand()) return;

    const command = this.#commands.get(interaction.commandName);
    if (!command) return;

    await this.app.context.run(
      async () => {
        try {
          const userId = interaction.user.id;
          if (!command.anonymous) {
            let user = await this.app.user.getFromProvider(
              AccountProvider.DISCORD, userId);

            if (!user) {
              const member = await this.getMemberFromId(userId);
              if (!member) {
                await interaction.reply({
                  content: `Utilize o convite a seguir para entrar no server. Só membros deste server podem executar o comando solicitado. ${this.#guilds[this.#mainGuild].inviteUrl}`,
                  ephemeral: true
                });
                return;
              }
              user = await this.app.user.register(
                AccountProvider.DISCORD, userId, { name: member.displayName });
            }

            await this.app.auth.login(user);
          }
          await command.execute(interaction, this);
        } catch (e) {
          await interaction.reply({
            content: await userErrorMessage(e),
            ephemeral: true
          });
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
  #guilds;
  #mainGuild;
};
