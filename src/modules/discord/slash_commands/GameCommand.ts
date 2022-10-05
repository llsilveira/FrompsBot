import {
  ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions,
  InteractionUpdateOptions, MessageComponentInteraction, MessageOptions, ModalSubmitInteraction
} from "discord.js";

import Application from "../../../app/Application";
import { RepositoryFindOptions } from "../../../app/core/AppRepository";
import { GameModel } from "../../../app/core/models/gameModel";
import { GameRepository } from "../../../app/core/repositories/GameRepository";
import FrompsBotError from "../../../errors/FrompsBotError";
import Discord from "../../Discord";
import GameAutocompleteField from "../autocomplete_fields/GameAutocompleteField";
import ApplicationCommand from "../interaction/ApplicationCommand";
import MessagePaginator from "../message_components/MessagePaginator";
import GameModal from "../modals/GameModal";


export default class GameCommand extends ApplicationCommand {
  constructor(discord: Discord) {
    super("game", "Gerencia os jogos cadastrados no bot.");

    this.gameField = new GameAutocompleteField(this, "game");

    this.gamePaginator = new MessagePaginator<string>(
      "gamePaginator", this.updateListGamesMessage.bind(this), { annonymous: true }
    );

    this.gameModal = new GameModal(
      "gameModal",
      this.createGameCallback.bind(this),
      this.updateGameCallback.bind(this)
    );

    discord.registerInteractionHandler(this.gameField);
    discord.registerInteractionHandler(this.gamePaginator);
    discord.registerInteractionHandler(this.gameModal);

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
  }

  async handleInteraction(
    interaction: ChatInputCommandInteraction,
    app: Application
  ) {
    const command = interaction.options.getSubcommand();
    switch (command) {
    case "list": {
      await this.handleListGames(interaction, app);
      break;
    }
    case "add": {
      await this.handleAddGame(interaction);
      break;
    }
    case "update": {
      await this.handleUpdateGame(interaction, app);
      break;
    }
    case "remove": {
      await this.handleRemoveGame(interaction, app);
      break;
    }
    }
  }

  async handleListGames(
    interaction: ChatInputCommandInteraction,
    app: Application
  ) {
    const filter = interaction.options.getString("filter");
    const message = await this.listGamesMessage(app, 10, 1, filter || undefined);
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
    app: Application
  ) {
    const game = await this.gameField.getValue(interaction, app);
    // TODO: update
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const modal = this.gameModal.createModal(game);
    await interaction.showModal(modal);
  }

  async handleRemoveGame(
    interaction: ChatInputCommandInteraction,
    app: Application
  ) {
    const game = await this.gameField.getValue(interaction, app);
    // TODO: update
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    // TODO: test foreign key restrictions first

    const { game: gameService } = app.services;
    await gameService.removeGame(game);
    await interaction.reply({
      content: `O jogo '${game.name}' foi removido!`,
      ephemeral: true
    });
  }

  private async updateListGamesMessage(
    interaction: MessageComponentInteraction,
    app: Application,
    pageSize: number,
    pageNumber: number,
    filter: string
  ) {

    const message: MessageOptions = await this.listGamesMessage(
      app, pageSize, pageNumber, filter
    );
    await interaction.update(message as InteractionUpdateOptions);
  }

  private async listGamesMessage(
    app: Application,
    pageSize = 10,
    pageNumber = 1,
    filter = ""
  ): Promise<MessageOptions> {
    const params: RepositoryFindOptions<GameModel> = {
      pagination: { pageSize, pageNumber },
      order: ["name"]
    };

    if (filter.length > 0) {
      params.filter = GameRepository.combineFilters([
        GameRepository.strAttrFilter<GameModel>("name", filter),
        GameRepository.strAttrFilter<GameModel>("code", filter)
      ], { useOr: true });
    }

    const { game: gameService } = app.services;
    const results = (await gameService.listAndCountGames(params)).value;

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
        pageSize, pageNumber, totalPages, filter
      );
      message = { embeds: [embed], components: [paginator] };
    } else {
      message = { embeds: [embed] };
    }
    return message;
  }

  private async createGameCallback(
    interaction: ModalSubmitInteraction,
    app: Application,
    code: string,
    name: string,
    shortName?: string
  ) {
    await app.services.game.createGame(code, name, shortName);
    await interaction.reply({
      content: "Jogo criado com sucesso!",
      ephemeral: true
    });
  }

  private async updateGameCallback(
    interaction: ModalSubmitInteraction,
    app: Application,
    id: number,
    code: string,
    name: string,
    shortName?: string
  ) {
    const game = (await app.services.game.getGameFromId(id)).value;
    if (!game) {
      throw new FrompsBotError("O jogo selecionado não existe mais.");
    }

    await app.services.game.updateGame(game, code, name, shortName);
    await interaction.reply({
      content: "Jogo atualizado com sucesso!",
      ephemeral: true
    });
  }

  private readonly gameField;
  private readonly gamePaginator;
  private readonly gameModal;
}
