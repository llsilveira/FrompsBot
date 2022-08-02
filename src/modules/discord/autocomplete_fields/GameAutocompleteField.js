"use strict";

const AutocompleteField = require("../interaction/AutocompleteField");

module.exports = class GameAutocompleteField extends AutocompleteField {
  constructor(command, fieldName, options = {}) {
    const optionsCombined = Object.assign({ annonymous: true }, options);
    super(command.commandName, fieldName, optionsCombined);
  }

  async handleInteraction(interaction, context) {
    const currentValue = interaction.options.getFocused();
    const { game: gameService } = context.app.services;

    const params = { ordered: true, limit: 25 };
    if (currentValue?.length > 0) {
      params.filter = currentValue;
    }

    const games = await gameService.listGames(params);
    await interaction.respond(games.map(game => (
      { name: game.shortName, value: game.id }
    )));
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
    const { game: gameService } = context.app.services;

    let gameId;
    try {
      gameId = interaction.options.getNumber(this.fieldName);
    } catch (e) {
      return null;
    }

    return await gameService.getGameById(gameId, options);
  }
};
