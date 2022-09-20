import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";

import AutocompleteField, { AutocompleteFieldParent } from "../interaction/AutocompleteField";
import type ContextManager from "../../ContextManager";
import type ApplicationCommand from "../interaction/ApplicationCommand";
import { type InteractionHandlerOptions } from "../interaction/InteractionHandler";
import { IGameServiceGameOptions } from "../../../app/core/services/GameService";

export default class GameAutocompleteField extends AutocompleteField {

  constructor(
    command: ApplicationCommand,
    fieldName: string,
    options?: InteractionHandlerOptions
  ) {
    super(command.commandName, fieldName, options);
  }

  async handleInteraction(
    interaction: AutocompleteInteraction,
    context: ContextManager
  ) {
    const currentValue = interaction.options.getFocused();
    const { game: gameService } = context.app.services;

    const params: IGameServiceGameOptions = { ordered: true, limit: 25 };
    if (currentValue?.length > 0) {
      params.filter = currentValue;
    }

    const games = await gameService.listGames(params);
    await interaction.respond(games.map(game => (
      { name: game.shortName, value: game.id }
    )));
  }

  addTo<T extends AutocompleteFieldParent>(
    builder: T,
    description: string,
    isRequired: boolean = true
  ) {
    builder.addNumberOption(option =>
      option.setName(this.fieldName)
        .setDescription(description)
        .setRequired(isRequired)
        .setAutocomplete(true)
    );
  }

  async getValue(
    interaction: AutocompleteInteraction | ChatInputCommandInteraction,
    context: ContextManager,
    options?: IGameServiceGameOptions
  ) {
    const { game: gameService } = context.app.services;

    let gameId;
    try {
      gameId = interaction.options.getNumber(this.fieldName);
      if (!gameId) { return null; }
    } catch (e) {
      return null;
    }

    return await gameService.getGameById(gameId, options) || null;
  }
}
