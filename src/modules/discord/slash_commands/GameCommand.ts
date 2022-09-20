import {
  ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions,
  InteractionUpdateOptions, MessageComponentInteraction, MessageOptions, ModalSubmitInteraction
} from "discord.js";

import ContextManager from "../../ContextManager";
import { IGameServiceGameOptions } from "../../../app/core/services/GameService";
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

  private async updateListGamesMessage(
    interaction: MessageComponentInteraction,
    context: ContextManager,
    pageSize: number,
    pageNumber: number,
    filter: string
  ) {

    const message: MessageOptions = await this.listGamesMessage(
      context, pageSize, pageNumber, filter
    );
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

  private readonly gameField;
  private readonly gamePaginator;
  private readonly gameModal;
}
