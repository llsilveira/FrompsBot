import {
  ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions,
  InteractionUpdateOptions, MessageComponentInteraction, MessageOptions, ModalSubmitInteraction
} from "discord.js";

import { GameModel } from "../../../app/core/models/gameModel";
import Application from "../../../app/Application";
import FrompsBotError from "../../../errors/FrompsBotError";
import Discord from "../../Discord";
import GameAutocompleteField from "../autocomplete_fields/GameAutocompleteField";
import GameModeAutocompleteField from "../autocomplete_fields/GameModeAutocompleteField";
import ApplicationCommand from "../interaction/ApplicationCommand";
import MessagePaginator from "../message_components/MessagePaginator";
import GameModeModal from "../modals/GameModeModal";
import { RepositoryFindOptions } from "../../../app/core/AppRepository";
import { GameModeModel } from "../../../app/core/models/gameModeModel";
import GameModeRepository from "../../../app/core/repositories/GameModeRepository";


type GameModeCommandPaginatorArgs = [number, string];


export default class GameModeCommand extends ApplicationCommand {
  constructor(discord: Discord) {
    super("gamemode", "Gerencia os jogos cadastrados no bot.");

    this.gameField = new GameAutocompleteField(this, "game");
    this.gameModeField =
      new GameModeAutocompleteField(this, "mode", this.gameField);

    this.gamemodePaginator = new MessagePaginator<GameModeCommandPaginatorArgs>(
      "gamemodePaginator", this.updateListGameModesMessage.bind(this), { annonymous: true }
    );

    this.gameModeModal = new GameModeModal(
      "gameModeModal",
      this.createGameModeCallback.bind(this),
      this.updateGameModeCallback.bind(this)
    );

    discord.registerInteractionHandler(this.gameField);
    discord.registerInteractionHandler(this.gameModeField);
    discord.registerInteractionHandler(this.gamemodePaginator);
    discord.registerInteractionHandler(this.gameModeModal);

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("list")
        .setDescription("Lista os modos cadastrados para um jogo");

      this.gameField.addTo(subcommand, "Escolha o jogo.", true);

      subcommand.addStringOption(option =>
        option.setName("filter")
          .setDescription(
            "Os resultados serão filtrados utilizando este valor."
          )
      );
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("add")
        .setDescription("Adiciona um novo modo para um jogo");

      this.gameField.addTo(subcommand, "Escolha o jogo.", true);
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("update")
        .setDescription("Altera um modo de jogo.");
      this.gameField.addTo(subcommand, "Escolha o jogo.", true);
      this.gameModeField.addTo(
        subcommand, "Modo de jogo a ser alterado.", true
      );
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("describe")
        .setDescription("Descreve um modo de jogo");
      this.gameField.addTo(subcommand, "Escolha o jogo.", true);
      this.gameModeField.addTo(
        subcommand, "Selecione o dodo de jogo.", true
      );
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("remove")
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
    app: Application
  ) {
    const command = interaction.options.getSubcommand();
    switch (command) {
    case "list": {
      await this.handleListGameModes(interaction, app);
      break;
    }
    case "add": {
      await this.handleAddGameMode(interaction, app);
      break;
    }
    case "update": {
      await this.handleUpdateGameMode(interaction, app);
      break;
    }
    case "describe": {
      await this.handleDescribeGameMode(interaction, app);
      break;
    }
    case "remove": {
      await this.handleRemoveGameMode(interaction, app);
      break;
    }
    }
  }

  async handleListGameModes(
    interaction: ChatInputCommandInteraction,
    app: Application
  ) {
    const game = await this.gameField.getValue(interaction, app);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const filter = interaction.options.getString("filter") || "";

    const message = await this.listGameModesMessage(
      app, 10, 1, game.id, filter
    );
    await interaction.reply({
      ...(message as InteractionReplyOptions),
      ephemeral: true
    });
  }

  async handleAddGameMode(
    interaction: ChatInputCommandInteraction,
    app: Application
  ) {
    const game = await this.gameField.getValue(interaction, app);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const modal = this.gameModeModal.createModal(game);
    await interaction.showModal(modal);
  }

  async handleUpdateGameMode(
    interaction: ChatInputCommandInteraction,
    app: Application
  ) {
    const gameMode = await this.gameModeField.getValue(
      interaction, app, { include: ["game"] }
    );
    if (!gameMode) {
      const game = await this.gameField.getValue(interaction, app);
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
    app: Application
  ) {
    const gameMode = await this.gameModeField.getValue(
      interaction, app, { include: ["game"] }
    );
    if (!gameMode) {
      const game = await this.gameField.getValue(interaction, app);
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
    app: Application
  ) {
    const gameMode = await this.gameModeField.getValue(
      interaction, app, { include: ["game"] }
    );
    if (!gameMode) {
      const game = await this.gameField.getValue(interaction, app);
      if (!game) {
        throw new FrompsBotError("Jogo não encontrado!");
      }
      throw new FrompsBotError("Modo de jogo não encontrado!");
    }

    const { game: gameService } = app.services;
    await gameService.removeGameMode(gameMode);
    await interaction.reply({
      content: `O modo '${gameMode.name}' foi removido de ${(gameMode.game as GameModel).shortName}!`,
      ephemeral: true
    });
  }

  private async updateListGameModesMessage(
    interaction: MessageComponentInteraction,
    app: Application,
    pageSize: number,
    pageNumber: number,
    extraParams: GameModeCommandPaginatorArgs
  ) {
    const [gameId, filter] = extraParams;
    const message: MessageOptions = await this.listGameModesMessage(
      app, pageSize, pageNumber, gameId, filter
    );

    await interaction.update(message as InteractionUpdateOptions);
  }

  private async listGameModesMessage(
    app: Application,
    pageSize = 10,
    pageNumber = 1,
    gameId: number = -1,
    filter = ""
  ): Promise<MessageOptions> {
    const { game: gameService } = app.services;
    const game = (await gameService.getGameFromId(gameId)).value;
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const params: RepositoryFindOptions<GameModeModel> = {
      order: ["name"],
      pagination: { pageSize, pageNumber }
    };

    params.filter = GameModeRepository.combineFilters<GameModeModel>([
      { gameId: game.id },
      GameModeRepository.searchNameFilter(filter)
    ]);


    const results = (await gameService.listAndCountGameModes(params)).value;
    const modes = results.rows;

    const embed = new EmbedBuilder().setTitle(`${game.code} - Modos de jogo`);

    let description = `Modos de jogo de ${game.shortName}:`;

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
      const paginator = this.gamemodePaginator.getButtons(
        pageSize, pageNumber, totalPages, [gameId, filter]
      );
      return { embeds: [embed], components: [paginator] };
    } else {
      return { embeds: [embed] };
    }
  }

  private async createGameModeCallback(
    interaction: ModalSubmitInteraction,
    app: Application,
    gameId: number,
    name: string,
    description: string,
    longDescription: string
  ) {
    const { game: gameService } = app.services;

    const game = (await gameService.getGameFromId(gameId)).value;
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
    app: Application,
    gameModeId: number,
    name: string,
    description: string,
    longDescription: string
  ) {
    const { game: gameService } = app.services;

    const gameMode = (await gameService.getGameModeById(gameModeId)).value;
    if (!gameMode) {
      throw new FrompsBotError("O modo selecionado não existe mais.");
    }
    await app.services.game.updateGameMode(
      gameMode, name, description, longDescription
    );
    await interaction.reply({
      content: "Modo de jogo atualizado com sucesso!",
      ephemeral: true
    });
  }

  private readonly gameField;
  private readonly gameModeField;
  private readonly gamemodePaginator;
  private readonly gameModeModal;
}
