import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import Application from "../../../app/Application";
import { RepositoryFindOptions } from "../../../app/core/AppRepository";
import { GameModeModel } from "../../../app/core/models/gameModeModel";
import ApplicationCommand from "../interaction/ApplicationCommand";
import AutocompleteField, { AutocompleteFieldParent } from "../interaction/AutocompleteField";
import GameAutocompleteField from "./GameAutocompleteField";


export default class GameModeAutocompleteField extends AutocompleteField {
  constructor(
    command: ApplicationCommand,
    fieldName: string,
    gameField: GameAutocompleteField,
    options = {}
  ) {
    super(command.commandName, fieldName, options);

    this.#gameField = gameField;
  }

  async handleInteraction(
    interaction: AutocompleteInteraction,
    app: Application
  ) {
    const currentValue = interaction.options.getFocused();

    const game = await this.#gameField.getValue(interaction, app);
    if (!game) {
      await interaction.respond([
        { name: "Selecione um jogo válido!", value: -1 }
      ]);
      return;
    }

    const { game: gameService } = app.services;

    const params: RepositoryFindOptions<GameModeModel> = {
      limit: 25,
      order: ["name"]
    };

    const modes = (await gameService.findGameModeByName(game, currentValue, params)).value;
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
    options?: RepositoryFindOptions<GameModeModel>
  ) {
    const game = await this.#gameField.getValue(interaction, app);
    if (!game) {
      return null;
    }

    const { game: gameService } = app.services;

    let gameModeId;
    try {
      gameModeId = interaction.options.getNumber(this.fieldName);
      if (!gameModeId) { return null; }
    } catch (e) {
      return null;
    }

    return (await gameService.getGameModeById(gameModeId, options)).value;
  }

  #gameField;
}
