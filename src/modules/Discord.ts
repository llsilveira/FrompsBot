import {
  Client, GatewayIntentBits, Interaction, InteractionType, Routes
} from "discord.js";
import { REST } from "@discordjs/rest";

import AppModule from "../app/AppModule";
import Application from "../app/Application";
import InteractionHandler from "./discord/interaction/InteractionHandler";
import { UserModel } from "../app/core/models/userModel";
import AccountProvider from "../constants/AccountProvider";
import InteractionHandlerContainer from "./discord/InteractionHandlerContainer";

import { SlashCommandName, slashCommands } from "./discord/slash_commands";
import { UserNotFoundError } from "../app/core/services/AuthService";
import { ResultError } from "../app/core/logic/error/ResultError";


const DISCORD_REST_API_VERSION = "10";

interface DiscordConfig {
  token: string,
  clientId: string,
  guildId: string
}

export class DiscordUserError extends ResultError {
  constructor(message: string, readonly cause?: Error) {
    super(message);
    this.cause = cause;
  }
}

export default class Discord extends AppModule {
  constructor(app: Application) {
    super(app);

    const { token, clientId, guildId } = app.config.get<DiscordConfig>("discord");
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

    this.#client.once("ready", () => {
      this.logger.info("Discord bot is ready!");
    });

    this.#registerSlashCommands();
  }

  registerInteractionHandler<IType extends InteractionType>(interactionHandler: InteractionHandler<IType>) {
    this.#interactionHandlerContainer.registerHandler(interactionHandler);
  }

  async getDiscordId(user: UserModel) {
    const provider =
      await this.app.services.user.getProvider(user, AccountProvider.DISCORD);
    return provider?.providerId || null;
  }

  async getGuild(guildId: string) {
    const guild = this.#client.guilds.resolve(guildId);
    if (guild && !guild.available) {
      await guild.fetch();
    }
    return guild;
  }

  async getMainGuild() {
    return await this.getGuild(this.#guildId);
  }

  async getMemberFromId(userDiscordId: string) {
    const guild = await this.getMainGuild();
    try {
      const member = await guild?.members.fetch(userDiscordId);
      return member || null;
    } catch (e) {
      // User is not a member
      return null;
    }
  }

  async getMemberFromUser(user: UserModel) {
    const id = await this.getDiscordId(user);
    if (!id) { return null; }
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

  async #handleInteraction(interaction: Interaction, handler: InteractionHandler) {
    try {
      if (!handler.options.annonymous) {
        const userId = interaction.user.id;
        const result = await this.app.services.auth.authenticate(
          AccountProvider.DISCORD, userId);

        if (!result.success) {
          let errorMessage = "";
          if (result.error instanceof UserNotFoundError) {
            // TODO: alterar nome do comando dinamicamente
            errorMessage =
              "Você deve registrar-se (`/register`) antes de utilizar este comando.";
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _exhaustiveCheck: never = result.error;
          }
          throw new DiscordUserError(errorMessage);
        }

      }
      await handler.handleInteraction(interaction, this.app);

    } catch (e) {

      let rethrow, content;

      if (e instanceof DiscordUserError) {
        content = e.message;
        rethrow = false;
      } else {
        content = "Ocorreu um erro na execução deste comando. " +
          "Por favor, espere alguns minutos e tente novamente. " +
          "Se o erro persistir, informe um moderador.";
        rethrow = true;
      }

      // TODO: log if its autocomplete
      if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({
            content,
            embeds: [],
            components: [],
            files: [],
            attachments: []
          });
        } else {
          await interaction.reply({
            content,
            ephemeral: true,
            embeds: [],
            components: [],
            files: [],
            attachments: []
          });
        }
      }

      if (rethrow) { throw e; }
    }
  }

  #registerSlashCommands() {
    for (const command in slashCommands) {
      const instance = new (slashCommands[command as SlashCommandName])(this);
      this.registerInteractionHandler(instance);
    }
  }

  #client;

  #token;
  #clientId;
  #guildId;

  #interactionHandlerContainer;
}
