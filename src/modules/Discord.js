"use strict";


const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { AppModule } = require("../app");
const { AccountProvider } = require("../constants");
const { FrompsBotError } = require("../errors");

const slashCommands = require("./discord/slash_commands");
const permanentButtons = require("./discord/permanent_buttons");
const PermanentButtonContainer = require("./discord/PermanentButtonContainer");


class Discord extends AppModule {
  constructor(
    app,
    context,
    botController,
    userController,
    authController,
    gameController
  ) {
    super(app);

    this.#context = context;
    this.#controllers = Object.freeze({
      bot: botController,
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
    this.#permanentButtons = new PermanentButtonContainer();

    this.#client.on("interactionCreate", async interaction => {
      try {
        const handler = await this.#resolveInteraction(interaction);
        if (handler) {
          await this.#context.run(async () => {
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
    this.#registerPermanentButtons();
  }

  get controllers() {
    return this.#controllers;
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

  getPermanentButton(name, args = []) {
    return this.#permanentButtons.createButton(name, args);
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
    let interactionHandler;
    if (interaction.isCommand() || interaction.isAutocomplete()) {
      interactionHandler = this.#commands.get(interaction.commandName);
    } else if (interaction.isButton()) {
      interactionHandler = this.#permanentButtons.resolve(interaction);
    }

    return interactionHandler;
  }

  async #handleInteraction(interaction, handler) {
    try {
      const userId = interaction.user.id;
      let user = await this.#controllers.user.getFromProvider(
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

        user = await this.#controllers.user.register(
          AccountProvider.DISCORD, userId, name
        );
      }

      await this.#controllers.auth.login(user);
      if (interaction.isCommand()) {
        await handler.execute(interaction, this.#controllers);
      } else if (interaction.isButton()) {
        await handler.button.execute(interaction, ...handler.args);
      } else if (interaction.isAutocomplete()) {
        await handler.autocomplete(interaction, this.#controllers);
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

  #registerSlashCommands() {
    for (const command in slashCommands) {
      const instance = new slashCommands[command](this);
      this.#commands.set(instance.name, instance);
    }
  }

  #registerPermanentButtons() {
    for (const button in permanentButtons) {
      const instance = new permanentButtons[button](this);
      this.#permanentButtons.register(instance.name, instance);
    }
  }

  #client;
  #commands;
  #permanentButtons;
  #token;
  #clientId;
  #guildId;

  #context;
  #controllers;
}

AppModule.setModuleName(Discord, "discord");
module.exports = Discord;
