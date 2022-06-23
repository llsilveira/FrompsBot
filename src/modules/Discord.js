"use strict";


const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { AppModule } = require("../app");
const { AccountProvider } = require("../constants");
const { FrompsBotError } = require("../errors");

const slashCommands = require("./discord/slash_commands");


class Discord extends AppModule {
  constructor(
    app,
    context,
    userController,
    authController,
    gameController
  ) {
    super(app);

    this.#context = context;
    this.#controllers = Object.freeze({
      user: userController,
      auth: authController,
      game: gameController
    });

    const { token, clientId, guildId } = app.config.get("discord");
    this.#token = token;
    this.#clientId = clientId;
    this.#guildId = guildId;

    this.#client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
    });
    this.#commands = new Collection();

    this.#client.on("interactionCreate", async interaction => {
      try {
        await this.#resolveInteraction(interaction);
      } catch (e) {
        this.logger.error("An error ocurred during interaction handling:", e);
      }
    });

    this.#client.once("ready", async () => {
      this.logger.info("Discord bot is ready!");
    });

    this.#registerSlashCommands();
  }

  async getDiscordId(user) {
    const provider =
      await this.#controllers.user.getProvider(user, AccountProvider.DISCORD);
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
    const guild = await this.getMainGuild();
    try {
      const member = await guild.members.fetch(userDiscordId);
      return member;
    } catch (e) {
      // User is not a member
      return null;
    }
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
    if (!(interaction.isCommand() || interaction.isAutocomplete())) return;

    const command = this.#commands.get(interaction.commandName);
    if (!command) return;

    await this.#context.run(
      async () => {
        try {
          const userId = interaction.user.id;
          let user = await this.#controllers.user.getFromProvider(AccountProvider.DISCORD, userId);

          if (!user) {
            let name;
            if (interaction.guild?.id === this.#guildId) {
              name = interaction.member.displayName;
            } else {
              const member = await this.getMemberFromId(userId);

              if (member) {
                name = member.displayName;
              } else {
                name = interaction.user.username;
              }
            }

            user = await this.#controllers.user.register(AccountProvider.DISCORD, userId, name);
          }

          await this.#controllers.auth.login(user);
          if (interaction.isAutocomplete()) {
            await command.autocomplete(interaction, this.#controllers);
          } else {
            await command.execute(interaction, this.#controllers);
          }
        } catch (e) {
          let rethrow, content, sendMessage;

          if (e instanceof FrompsBotError) {
            content = e.message;
            rethrow = false;
          } else {
            content = "Ocorreu um erro na execução deste comando. " +
              "Por favor, espere alguns minutos e tente novamente. " +
              "Se o erro persistir, informe um moderador.";
            rethrow = true;
          }

          if (interaction.replied || interaction.deferred) {
            sendMessage = interaction.editReply;
          } else {
            sendMessage = interaction.reply;
          }

          await sendMessage.call(interaction, {
            content,
            ephemeral: true,
            embeds: [],
            components: [],
            files: [],
            attachments: []
          });

          if (rethrow) { throw e; }
        }
      }
    );
  }

  #registerSlashCommands() {
    for (const command in slashCommands) {
      const instance = new slashCommands[command]();
      this.#commands.set(instance.name, instance);
    }
  }

  #client;
  #commands;
  #token;
  #clientId;
  #guildId;

  #context;
  #controllers;
}

AppModule.setModuleName(Discord, "discord");
module.exports = Discord;
