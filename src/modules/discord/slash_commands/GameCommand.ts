import {
  ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions,
  InteractionUpdateOptions, MessageComponentInteraction, MessageOptions
} from "discord.js";

import { GameModel } from "../../../core/models/gameModel";
import ContextManager from "../../../core/modules/ContextManager";
import { IGameServiceGameModeOptions, IGameServiceGameOptions } from "../../../core/services/GameService";
import { JSONSerializable } from "../../../core/type";
import FrompsBotError from "../../../errors/FrompsBotError";
import Discord from "../../Discord";
import GameAutocompleteField from "../autocomplete_fields/GameAutocompleteField";
import GameModeAutocompleteField from "../autocomplete_fields/GameModeAutocompleteField";
import ApplicationCommand from "../interaction/ApplicationCommand";
import MessagePaginator from "../message_components/MessagePaginator";

export default class GameCommand extends ApplicationCommand {
  constructor(discord: Discord) {
    super("game", "Gerencia os jogos cadastrados no bot.");

    this.#gameField = new GameAutocompleteField(this, "game");
    this.#gameModeField =
      new GameModeAutocompleteField(this, "game_mode", this.#gameField);

    this.#gamePaginator = new MessagePaginator(
      "gameListGame", this.#updateListGamesMessage.bind(this), { annonymous: true }
    );

    discord.registerInteractionHandler(this.#gameField);
    discord.registerInteractionHandler(this.#gameModeField);
    discord.registerInteractionHandler(this.#gamePaginator);

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("list")
        .setDescription("Lista os jogos cadastrados no bot.")
        .addStringOption(option =>
          option.setName("filter")
            .setDescription(
              "Os resultados serão filtrados utilizando este valor."
            )
        )
    );

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("add")
        .setDescription("Adiciona um novo jogo")
        .addStringOption(option =>
          option.setName("code")
            .setDescription("Código do jogo. Ex: ALTTPR.")
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("name")
            .setDescription("Nome do jogo.")
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("short_name")
            .setDescription("Nome abreviado (máximo 32 caracteres).")
        )
    );

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("remove")
        .setDescription("Remove um jogo");
      this.#gameField.addTo(subcommand, "Jogo a ser removido", true);
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("list_modes")
        .setDescription("Lista os modos cadastrados para um jogo");

      this.#gameField.addTo(subcommand, "Escolha o jogo.", true);

      subcommand.addBooleanOption(option =>
        option.setName("include_all")
          .setDescription("Incluir todos os modos (inclusive desativados).")
      );
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("add_mode")
        .setDescription("Adiciona um novo modo para um jogo");

      this.#gameField.addTo(subcommand, "Escolha o jogo.", true);

      subcommand.addStringOption(option =>
        option.setName("name")
          .setDescription("Nome do modo de jogo.")
          .setRequired(true)
      ).addStringOption(option =>
        option.setName("description")
          .setDescription("Descrição do modo (máximo 80 caracteres).")
          .setRequired(true)
      );
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("remove_mode")
        .setDescription("Remove um modo de um jogo");
      this.#gameField.addTo(subcommand, "Escolha o jogo.", true);
      this.#gameModeField.addTo(
        subcommand, "Modo de jogo a ser removido.", true
      );
      return subcommand;
    });
  }

  async handleInteraction(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const command = interaction.options.getSubcommand();
    switch (command) {
    case "list": {
      await this.handleListGames(interaction, context);
      break;
    }
    case "add": {
      await this.handleAddGame(interaction, context);
      break;
    }
    case "remove": {
      await this.handleRemoveGame(interaction, context);
      break;
    }
    case "list_modes": {
      await this.handleListGameModes(interaction, context);
      break;
    }
    case "add_mode": {
      await this.handleAddGameMode(interaction, context);
      break;
    }
    case "remove_mode": {
      await this.handleRemoveGameMode(interaction, context);
      break;
    }
    }
  }

  async handleListGames(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const filter = interaction.options.getString("filter");
    const message = await this.#listGamesMessage(context, 10, 1, filter || undefined);
    await interaction.reply({
      ...(message as InteractionReplyOptions),
      ephemeral: true
    });
  }

  async handleAddGame(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const { game: gameService } = context.app.services;

    const code = interaction.options.getString("code", true);
    const name = interaction.options.getString("name", true);
    const shortName = interaction.options.getString("short_name");

    await gameService.createGame(code, name, shortName || undefined);
    await interaction.reply({
      content: `O jogo '${name}' foi adicionado com sucesso!`,
      ephemeral: true
    });
  }

  async handleRemoveGame(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const game = await this.#gameField.getValue(interaction, context);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    // TODO: test foreign key restrictions first

    const { game: gameService } = context.app.services;
    await gameService.removeGame(game);
    await interaction.reply({
      content: `O jogo '${game.name}' foi removido!`,
      ephemeral: true
    });
  }

  async handleListGameModes(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const game = await this.#gameField.getValue(interaction, context);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const filter = interaction.options.getString("filter") || "";
    const includeAll = interaction.options.getBoolean("include_all") || false;

    const message = await this.#listGameModesMessage(
      context, 10, 1, game.id, filter, includeAll
    );
    await interaction.reply({
      ...(message as InteractionReplyOptions),
      ephemeral: true
    });
  }

  async handleAddGameMode(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const game = await this.#gameField.getValue(interaction, context);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const name = interaction.options.getString("name", true);
    const description = interaction.options.getString("description", true);
    const { game: gameService } = context.app.services;

    await gameService.createGameMode(game, name, description);
    await interaction.reply({
      content: `O modo '${name}' foi criado com sucesso!`,
      ephemeral: true
    });
  }

  async handleRemoveGameMode(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const gameMode = await this.#gameModeField.getValue(
      interaction, context, { includeGame: true }
    );
    if (!gameMode) {
      const game = await this.#gameField.getValue(interaction, context);
      if (!game) {
        throw new FrompsBotError("Jogo não encontrado!");
      }
      throw new FrompsBotError("Modo de jogo não encontrado!");
    }

    const { game: gameService } = context.app.services;
    await gameService.removeGameMode(gameMode);
    await interaction.reply({
      content: `O modo '${gameMode.name}' foi removido de ${(gameMode.game as GameModel).shortName}!`,
      ephemeral: true
    });
  }

  async #updateListGamesMessage(
    interaction: MessageComponentInteraction,
    context: ContextManager,
    pageSize: number,
    pageNumber: number,
    extraParams?: JSONSerializable
  ) {
    // TODO: maybe throw an error
    if (!extraParams || !Array.isArray(extraParams)) { return; }

    const [ selector ] = extraParams as [string];
    const values = (extraParams as unknown[]).slice(1);

    let message: MessageOptions;
    if (selector === "game") {
      message = await this.#listGamesMessage(
        context, pageSize, pageNumber, values.length > 0 ? values[0] as string : undefined
      );
    } else if (selector === "gameMode") {
      message = await this.#listGameModesMessage(
        context, pageSize, pageNumber, ...(values as [number, string?, boolean?])
      );
    } else {
      throw new Error("Invalid selector on interaction");
    }

    await interaction.update(message as InteractionUpdateOptions);
  }

  async #listGamesMessage(
    context: ContextManager,
    pageSize = 10,
    pageNumber = 1,
    filter?: string
  ): Promise<MessageOptions> {
    const params: IGameServiceGameOptions = {
      ordered: true,
      pagination: { pageSize, pageNumber }
    };

    if (filter) { params.filter = filter; }

    const { game: gameService } = context.app.services;
    const results = await gameService.listAndCountGames(params);

    const games = results.rows;
    let codes = "";
    let names = "";

    games.forEach(game => {
      codes += `${game.code}\n`;
      names += `${game.name}\n`;
    });

    const embed = new EmbedBuilder().setTitle("Jogos cadastrados");
    let description = "Lista de jogos cadastrados no bot";
    if (filter) {
      description += ` contendo '${filter}'`;
    }

    if (games.length > 0) {
      embed.setDescription(description).addFields(
        { name: "Nome do Jogo", value: names, inline: true },
        { name: "Código", value: codes, inline: true }
      );
    } else {
      embed.setDescription(
        description + "\n\n**Nenhum jogo encontrado!**");
    }

    const totalPages = Math.ceil(results.count / pageSize);
    let message: MessageOptions = {};
    if (totalPages > 1) {
      let paginator;
      if (filter) {
        paginator = this.#gamePaginator.getButtons(
          pageSize, pageNumber, totalPages, ["game", filter]
        );
      } else {
        paginator = this.#gamePaginator.getButtons(
          pageSize, pageNumber, totalPages, ["game"]
        );
      }
      message = { embeds: [embed], components: [paginator] };
    } else {
      message = { embeds: [embed] };
    }
    return message;
  }

  async #listGameModesMessage(
    context: ContextManager,
    pageSize = 10,
    pageNumber = 1,
    gameId: number,
    filter = "",
    includeAll = false
  ): Promise<MessageOptions> {
    const { game: gameService } = context.app.services;
    const game = await gameService.getGameById(gameId);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const params: IGameServiceGameModeOptions = {
      gameId: game.id,
      includeAll,
      ordered: true,
      pagination: { pageSize, pageNumber }
    };

    if (filter) { params.filter = filter; }

    const results = await gameService.listAndCountGameModes(params);
    const modes = results.rows;

    const embed = new EmbedBuilder().setTitle(`${game.code} - Modos de jogo`);

    let description = `Modos de jogo de ${game.shortName}`;
    if (includeAll) { description += " (incluindo modos desabilitados)"; }
    description += ":";

    if (modes.length > 0) {
      embed.addFields(modes.sort((a, b) => a.name < b.name ? -1 : 1)
        .map(mode => ({
          name: mode.name,
          value: mode.description
        }))
      );
    } else {
      description += "\n\n**Nenhum modo encontrado para este jogo!**";
    }
    embed.setDescription(description);

    const totalPages = Math.ceil(results.count / pageSize);
    if (totalPages > 1) {
      const paginator = this.#gamePaginator.getButtons(
        pageSize, pageNumber, totalPages, ["gameMode", gameId, filter, includeAll]
      );
      return { embeds: [embed], components: [paginator] };
    } else {
      return { embeds: [embed] };
    }
  }

  #gameField;
  #gameModeField;
  #gamePaginator;
}
