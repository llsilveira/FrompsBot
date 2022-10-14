import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";

import AutocompleteField, { AutocompleteFieldParent } from "../interaction/AutocompleteField";
import type Application from "../../../app/Application";
import type ApplicationCommand from "../interaction/ApplicationCommand";
import { type InteractionHandlerOptions } from "../interaction/InteractionHandler";
import { RepositoryFindOptions } from "../../../app/core/AppRepository";
import { GameModel } from "../../../app/core/models/gameModel";
import GameRepository from "../../../app/core/repositories/GameRepository";

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
    app: Application
  ) {
    const currentValue = interaction.options.getFocused();
    const { game: gameService } = app.services;

    const params: RepositoryFindOptions<GameModel> = {
      limit: 25,
      order: ["name"]
    };

    if (currentValue?.length > 0) {
      params.filter = GameRepository.combineFilters<GameModel>([
        GameRepository.strAttrFilter("code", currentValue),
        GameRepository.strAttrFilter("name", currentValue)
      ], { useOr: true });
    }

    const games = (await gameService.listGames(params)).value;


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
    app: Application,
    options?: RepositoryFindOptions<GameModel>
  ) {
    const { game: gameService } = app.services;

    let gameId;
    try {
      gameId = interaction.options.getNumber(this.fieldName);
      if (!gameId) { return null; }
    } catch (e) {
      return null;
    }

    return (await gameService.getGameFromId(gameId, options)).value;
  }
}
