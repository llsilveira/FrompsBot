import {
  ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions,
  InteractionUpdateOptions, MessageComponentInteraction, MessageOptions, ModalSubmitInteraction
} from "discord.js";

import { GameModel } from "../../../core/models/gameModel";
import ContextManager from "../../../core/modules/ContextManager";
import { IGameServiceGameModeOptions, IGameServiceGameOptions } from "../../../core/services/GameService";
import FrompsBotError from "../../../errors/FrompsBotError";
import Discord from "../../Discord";
import GameAutocompleteField from "../autocomplete_fields/GameAutocompleteField";
import GameModeAutocompleteField from "../autocomplete_fields/GameModeAutocompleteField";
import ApplicationCommand from "../interaction/ApplicationCommand";
import MessagePaginator from "../message_components/MessagePaginator";
import GameModal from "../modals/GameModal";
import GameModeModal from "../modals/GameModeModal";


type GameCommandPaginatorArgs =
  ["game", string] | ["gameMode", number, string, boolean];


export default class GameCommand extends ApplicationCommand {
  constructor(discord: Discord) {
    super("game", "Gerencia os jogos cadastrados no bot.");

    this.gameField = new GameAutocompleteField(this, "game");
    this.gameModeField =
      new GameModeAutocompleteField(this, "game_mode", this.gameField);

    this.gamePaginator = new MessagePaginator<GameCommandPaginatorArgs>(
      "gameListGame", this.updateListGamesMessage.bind(this), { annonymous: true }
    );

    this.gameModal = new GameModal(
      "gameModal",
      this.createGameCallback.bind(this),
      this.updateGameCallback.bind(this)
    );

    this.gameModeModal = new GameModeModal(
      "gameModeModal",
      this.createGameModeCallback.bind(this),
      this.updateGameModeCallback.bind(this)
    );

    discord.registerInteractionHandler(this.gameField);
    discord.registerInteractionHandler(this.gameModeField);
    discord.registerInteractionHandler(this.gamePaginator);
    discord.registerInteractionHandler(this.gameModal);
    discord.registerInteractionHandler(this.gameModeModal);

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
    );

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("update")
        .setDescription("Altera um jogo");
      this.gameField.addTo(subcommand, "Jogo a ser alterado", true);
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("remove")
        .setDescription("Remove um jogo");
      this.gameField.addTo(subcommand, "Jogo a ser removido", true);
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("list_modes")
        .setDescription("Lista os modos cadastrados para um jogo");

      this.gameField.addTo(subcommand, "Escolha o jogo.", true);

      subcommand.addStringOption(option =>
        option.setName("filter")
          .setDescription(
            "Os resultados serão filtrados utilizando este valor."
          )
      )
        .addBooleanOption(option =>
          option.setName("include_all")
            .setDescription("Incluir todos os modos (inclusive desativados).")
        );
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("add_mode")
        .setDescription("Adiciona um novo modo para um jogo");

      this.gameField.addTo(subcommand, "Escolha o jogo.", true);
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("update_mode")
        .setDescription("Altera um modo de jogo.");
      this.gameField.addTo(subcommand, "Escolha o jogo.", true);
      this.gameModeField.addTo(
        subcommand, "Modo de jogo a ser alterado.", true
      );
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("describe_mode")
        .setDescription("Descreve um modo de jogo");
      this.gameField.addTo(subcommand, "Escolha o jogo.", true);
      this.gameModeField.addTo(
        subcommand, "Selecione o dodo de jogo.", true
      );
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("remove_mode")
        .setDescription("Remove um modo de um jogo");
      this.gameField.addTo(subcommand, "Escolha o jogo.", true);
      this.gameModeField.addTo(
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
      await this.handleAddGame(interaction);
      break;
    }
    case "update": {
      await this.handleUpdateGame(interaction, context);
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
    case "update_mode": {
      await this.handleUpdateGameMode(interaction, context);
      break;
    }
    case "describe_mode": {
      await this.handleDescribeGameMode(interaction, context);
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
    const message = await this.listGamesMessage(context, 10, 1, filter || undefined);
    await interaction.reply({
      ...(message as InteractionReplyOptions),
      ephemeral: true
    });
  }

  async handleAddGame(
    interaction: ChatInputCommandInteraction
  ) {
    const modal = this.gameModal.createModal();
    await interaction.showModal(modal);
  }

  async handleUpdateGame(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const game = await this.gameField.getValue(interaction, context);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const modal = this.gameModal.createModal(game);
    await interaction.showModal(modal);
  }

  async handleRemoveGame(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const game = await this.gameField.getValue(interaction, context);
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
    const game = await this.gameField.getValue(interaction, context);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const filter = interaction.options.getString("filter") || "";
    const includeAll = interaction.options.getBoolean("include_all") || false;

    const message = await this.listGameModesMessage(
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
    const game = await this.gameField.getValue(interaction, context);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const modal = this.gameModeModal.createModal(game);
    await interaction.showModal(modal);
  }

  async handleUpdateGameMode(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const gameMode = await this.gameModeField.getValue(
      interaction, context, { includeGame: true }
    );
    if (!gameMode) {
      const game = await this.gameField.getValue(interaction, context);
      if (!game) {
        throw new FrompsBotError("Jogo não encontrado!");
      }
      throw new FrompsBotError("Modo de jogo não encontrado!");
    }

    const modal = this.gameModeModal.createModal(gameMode.game as GameModel, gameMode);
    await interaction.showModal(modal);
  }

  async handleDescribeGameMode(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const gameMode = await this.gameModeField.getValue(
      interaction, context, { includeGame: true }
    );
    if (!gameMode) {
      const game = await this.gameField.getValue(interaction, context);
      if (!game) {
        throw new FrompsBotError("Jogo não encontrado!");
      }
      throw new FrompsBotError("Modo de jogo não encontrado!");
    }

    const game = gameMode.game as GameModel;

    const embed = new EmbedBuilder().setTitle(`${gameMode.name}`)
      .setDescription(`\
**Jogo**: ${game.name}

**${gameMode.description}**

${gameMode.longDescription}
`);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  async handleRemoveGameMode(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const gameMode = await this.gameModeField.getValue(
      interaction, context, { includeGame: true }
    );
    if (!gameMode) {
      const game = await this.gameField.getValue(interaction, context);
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

  private async updateListGamesMessage(
    interaction: MessageComponentInteraction,
    context: ContextManager,
    pageSize: number,
    pageNumber: number,
    extraParams: GameCommandPaginatorArgs
  ) {
    const [ selector ] = extraParams;

    let message: MessageOptions;
    if (selector === "game") {
      const [, filter] = extraParams;
      message = await this.listGamesMessage(
        context, pageSize, pageNumber, filter
      );
    } else if (selector === "gameMode") {
      const [, gameId, filter, includeAll] = extraParams;
      message = await this.listGameModesMessage(
        context, pageSize, pageNumber, gameId, filter, includeAll
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = selector;
      throw new Error("Invalid selector on interaction");
    }

    await interaction.update(message as InteractionUpdateOptions);
  }

  private async listGamesMessage(
    context: ContextManager,
    pageSize = 10,
    pageNumber = 1,
    filter = ""
  ): Promise<MessageOptions> {
    const params: IGameServiceGameOptions = {
      ordered: true,
      pagination: { pageSize, pageNumber }
    };

    if (filter.length > 0) { params.filter = filter; }

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
    if (filter.length > 0) {
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
      const paginator = this.gamePaginator.getButtons(
        pageSize, pageNumber, totalPages, ["game", filter]
      );
      message = { embeds: [embed], components: [paginator] };
    } else {
      message = { embeds: [embed] };
    }
    return message;
  }

  private async listGameModesMessage(
    context: ContextManager,
    pageSize = 10,
    pageNumber = 1,
    gameId: number = -1,
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

    if (filter.length > 0) { params.filter = filter; }

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
      const paginator = this.gamePaginator.getButtons(
        pageSize, pageNumber, totalPages, ["gameMode", gameId, filter, includeAll]
      );
      return { embeds: [embed], components: [paginator] };
    } else {
      return { embeds: [embed] };
    }
  }

  private async createGameCallback(
    interaction: ModalSubmitInteraction,
    context: ContextManager,
    code: string,
    name: string,
    shortName?: string
  ) {
    await context.app.services.game.createGame(code, name, shortName);
    await interaction.reply({
      content: "Jogo criado com sucesso!",
      ephemeral: true
    });
  }

  private async updateGameCallback(
    interaction: ModalSubmitInteraction,
    context: ContextManager,
    id: number,
    code: string,
    name: string,
    shortName?: string
  ) {
    const game = await context.app.services.game.getGameById(id);
    if (!game) {
      throw new FrompsBotError("O jogo selecionado não existe mais.");
    }

    await context.app.services.game.updateGame(game, code, name, shortName);
    await interaction.reply({
      content: "Jogo atualizado com sucesso!",
      ephemeral: true
    });
  }

  private async createGameModeCallback(
    interaction: ModalSubmitInteraction,
    context: ContextManager,
    gameId: number,
    name: string,
    description: string,
    longDescription: string
  ) {
    const { game: gameService } = context.app.services;

    const game = await gameService.getGameById(gameId);
    if (!game) {
      throw new FrompsBotError("O jogo informado não está cadastrado neste bot.");
    }

    await gameService.createGameMode(game, name, description, longDescription);
    await interaction.reply({
      content: "Modo de jogo criado com sucesso!",
      ephemeral: true
    });
  }

  private async updateGameModeCallback(
    interaction: ModalSubmitInteraction,
    context: ContextManager,
    gameModeId: number,
    name: string,
    description: string,
    longDescription: string
  ) {
    const { game: gameService } = context.app.services;

    const gameMode = await gameService.getGameModeById(gameModeId);
    if (!gameMode) {
      throw new FrompsBotError("O modo selecionado não existe mais.");
    }
    await context.app.services.game.updateGameMode(
      gameMode, name, description, longDescription
    );
    await interaction.reply({
      content: "Modo de jogo atualizado com sucesso!",
      ephemeral: true
    });
  }

  private readonly gameField;
  private readonly gameModeField;
  private readonly gamePaginator;
  private readonly gameModal;
  private readonly gameModeModal;
}
