"use strict";

const { EmbedBuilder } = require("discord.js");
const FrompsBotError = require("../../../errors/FrompsBotError");
const GameAutocompleteField = require("../autocomplete_fields/GameAutocompleteField");
const GameModeAutocompleteField = require("../autocomplete_fields/GameModeAutocompleteField");
const ApplicationCommand = require("../interaction/ApplicationCommand");
const MessagePaginator = require("../message_components/MessagePaginator");

module.exports = class GameCommand extends ApplicationCommand {
  constructor(discord) {
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

  async handleInteraction(interaction, context) {
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

  async handleListGames(interaction, context) {
    const filter = interaction.options.getString("filter");
    const message = await this.#listGamesMessage(context, 10, 1, filter);
    await interaction.reply({
      ...message,
      ephemeral: true
    });
  }

  async handleAddGame(interaction, context) {
    const { game: gameService } = context.app.services;

    const code = interaction.options.getString("code");
    const name = interaction.options.getString("name");
    const shortName = interaction.options.getString("short_name");

    await gameService.createGame(code, name, shortName);
    await interaction.reply({
      content: `O jogo '${name}' foi adicionado com sucesso!`,
      ephemeral: true
    });
  }

  async handleRemoveGame(interaction, context) {
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

  async handleListGameModes(interaction, context) {
    const game = await this.#gameField.getValue(interaction, context);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const filter = interaction.options.getString("filter");
    const includeAll = interaction.options.getBoolean("include_all");

    const message = await this.#listGameModesMessage(
      context, 1, 1, game.id, filter, includeAll
    );
    await interaction.reply({
      ...message,
      ephemeral: true
    });
  }

  async handleAddGameMode(interaction, context) {
    const game = await this.#gameField.getValue(interaction, context);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const name = interaction.options.getString("name");
    const description = interaction.options.getString("description");
    const { game: gameService } = context.app.services;

    await gameService.createGameMode(game, name, description);
    await interaction.reply({
      content: `O modo '${name}' foi criado com sucesso!`,
      ephemeral: true
    });
  }

  async handleRemoveGameMode(interaction, context) {
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
      content: `O modo '${gameMode.name}' foi removido de ${gameMode.game.shortName}!`,
      ephemeral: true
    });
  }


  async #updateListGamesMessage(
    interaction, context, pageSize, pageNumber, selector, ...args
  ) {
    let message;
    if (selector === "game") {
      message = await this.#listGamesMessage(
        context, pageSize, pageNumber, ...args
      );
    } else if (selector === "gameMode") {
      message = await this.#listGameModesMessage(
        context, pageSize, pageNumber, ...args
      );
    } else {
      throw new Error("Invalid selector on interaction");
    }

    await interaction.update(message);
  }

  async #listGamesMessage(context, pageSize = 10, pageNumber = 1, filter) {
    const params = {
      ordered: true,
      count: true,
      pagination: { pageSize, pageNumber }
    };

    if (filter) { params.filter = filter; }

    const { game: gameService } = context.app.services;
    const results = await gameService.listGames(params);

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
    if (totalPages > 1) {
      let paginator;
      if (filter) {
        paginator = this.#gamePaginator.createActionRow(
          pageSize, pageNumber, totalPages, "game", filter
        );
      } else {
        paginator = this.#gamePaginator.createActionRow(
          pageSize, pageNumber, totalPages, "game"
        );
      }
      return { embeds: [embed], components: [paginator] };
    } else {
      return { embeds: [embed] };
    }
  }

  async #listGameModesMessage(
    context, pageSize = 10, pageNumber = 1, gameId, filter = "", includeAll = false
  ) {
    const { game: gameService } = context.app.services;
    const game = await gameService.getGameById(gameId);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const params = {
      gameId: game.id,
      includeAll,
      ordered: true,
      count: true,
      pagination: { pageSize, pageNumber }
    };

    if (filter) { params.filter = filter; }

    const results = await gameService.listGameModes(params);
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
      const paginator = this.#gamePaginator.createActionRow(
        pageSize, pageNumber, totalPages, "gameMode", gameId, filter, includeAll
      );
      return { embeds: [embed], components: [paginator] };
    } else {
      return { embeds: [embed] };
    }
  }

  #gameField;
  #gameModeField;
  #gamePaginator;
};
