"use strict";

const { Client, GatewayIntentBits, Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");

const { AppModule } = require("../app");
const { AccountProvider } = require("../core/constants");
const { FrompsBotError } = require("../errors");

const slashCommands = require("./discord/slash_commands");
const InteractionHandlerContainer = require("./discord/InteractionHandlerContainer");

const DISCORD_REST_API_VERSION = "10";

class Discord extends AppModule {
  constructor(app) {
    super(app);

    const { token, clientId, guildId } = app.config.get("discord");
    this.#token = token;
    this.#clientId = clientId;
    this.#guildId = guildId;

    this.#client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
    });

    this.#interactionHandlerContainer = new InteractionHandlerContainer();

    this.#client.on("interactionCreate", async interaction => {
      try {
        const handler =
          this.#interactionHandlerContainer.getHandlerFor(interaction);
        if (handler) {
          await this.app.context.run(async () => {
            await this.#handleInteraction(interaction, handler);
          });
        }
      } catch (e) {
        this.logger.error("An error ocurred during interaction handling:", e);
      }
    });

    this.#client.once("ready", async () => {
      this.logger.info("Discord bot is ready!");
    });

    this.#registerSlashCommands();
  }

  registerInteractionHandler(interactionHandler) {
    this.#interactionHandlerContainer.registerHandler(interactionHandler);
  }

  async getDiscordId(user) {
    const provider =
      await this.app.services.user.getProvider(user, AccountProvider.DISCORD);
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
    for (const command of this.#interactionHandlerContainer
      .getApplicationCommands()) {
      commands.push(command.builder.toJSON());
    }

    const rest = new REST(
      { version: DISCORD_REST_API_VERSION }
    ).setToken(this.#token);

    return await rest.put(
      Routes.applicationGuildCommands(this.#clientId, this.#guildId),
      { body: commands }
    );
  }

  async #handleInteraction(interaction, handler) {
    try {
      if (!handler.annonymous) {
        const userId = interaction.user.id;
        let user = await this.app.services.user.getFromProvider(
          AccountProvider.DISCORD, userId
        );

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

          user = await this.app.services.user.register(
            AccountProvider.DISCORD, userId, name
          );
        }

        this.app.services.auth.login(user);
      }
      await handler.handleInteraction(interaction, this.app.context);

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

  #registerSlashCommands() {
    for (const command in slashCommands) {
      const instance = new slashCommands[command](this);
      this.registerInteractionHandler(instance);
    }
  }

  #client;

  #token;
  #clientId;
  #guildId;

  #interactionHandlerContainer;
}

AppModule.setModuleName(Discord, "discord");
module.exports = Discord;
