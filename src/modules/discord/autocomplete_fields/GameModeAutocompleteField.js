"use strict";

const AutocompleteField = require("../interaction/AutocompleteField");

module.exports = class GameModeAutocompleteField extends AutocompleteField {
  constructor(command, fieldName, gameField, options = {}) {
    const optionsCombined = Object.assign({ annonymous: true }, options);
    super(command.commandName, fieldName, optionsCombined);

    this.#gameField = gameField;
  }

  async handleInteraction(interaction, context) {
    const currentValue = interaction.options.getFocused();

    const game = await this.#gameField.getValue(interaction, context);
    if (!game) {
      await interaction.respond([
        { name: "Selecione um jogo válido!", value: -1 }
      ]);
      return;
    }

    const { game: gameService } = context.app.services;

    const params = { gameId: game.id, ordered: true, limit: 25 };
    if (currentValue?.length > 0) {
      params.filter = currentValue;
    }

    const modes = await gameService.listGameModes(params);
    if (modes.length > 0) {
      await interaction.respond(modes.map(mode => (
        { name: mode.name, value: mode.id }
      )));
    } else {
      await interaction.respond([
        { name: "Modo de jogo não encontrado.", value: -1 }
      ]);
    }
  }

  addTo(builder, description, isRequired = true) {
    builder.addNumberOption(option =>
      option.setName(this.fieldName)
        .setDescription(description)
        .setRequired(isRequired)
        .setAutocomplete(true)
    );
  }

  async getValue(interaction, context, options) {
    const game = await this.#gameField.getValue(interaction, context);
    if (!game) {
      return null;
    }

    const { game: gameService } = context.app.services;

    let gameModeId;
    try {
      gameModeId = interaction.options.getNumber(this.fieldName);
    } catch (e) {
      return null;
    }

    return await gameService.getGameModeById(game.id, gameModeId, options);
  }

  #gameField;
};
