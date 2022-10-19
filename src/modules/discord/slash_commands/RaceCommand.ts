import { ChatInputCommandInteraction, ModalSubmitInteraction } from "discord.js";
import Application from "../../../app/Application";
import { GameModel } from "../../../app/core/models/gameModel";
import FrompsBotError from "../../../errors/FrompsBotError";
import Discord from "../../Discord";
import GameAutocompleteField from "../autocomplete_fields/GameAutocompleteField";
import GameModeAutocompleteField from "../autocomplete_fields/GameModeAutocompleteField";
import ApplicationCommand from "../interaction/ApplicationCommand";
import RaceCreateModal from "../modals/RaceCreateModal";

export default class RaceCommand extends ApplicationCommand {
  constructor(discord: Discord) {
    super("race", "Cria ou gerencia corridas.");

    this.gameAutocompleteField = new GameAutocompleteField(this, "game");
    this.gamemodeAutocompleteField = new GameModeAutocompleteField(
      this, "gamemode", this.gameAutocompleteField
    );

    this.raceCreateModal = new RaceCreateModal(
      "raceModal",
      this.raceCreateModalCallback.bind(this)
    );

    discord.registerInteractionHandler(this.gameAutocompleteField);
    discord.registerInteractionHandler(this.gamemodeAutocompleteField);
    discord.registerInteractionHandler(this.raceCreateModal);


    this.builder.addSubcommand(subcommand => {
      subcommand.setName("create")
        .setDescription("Cria uma nova corrida.");

      this.gameAutocompleteField.addTo(subcommand, "Jogo", true);
      this.gamemodeAutocompleteField.addTo(subcommand, "Modo de Jogo", true);

      return subcommand;
    });
  }

  async handleInteraction(
    interaction: ChatInputCommandInteraction,
    app: Application
  ) {
    const game = await this.gameAutocompleteField.getValue(interaction, app);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const gamemode = await this.gamemodeAutocompleteField.getValue(interaction, app);
    if (!gamemode) {
      throw new FrompsBotError("Modo de jogo não encontrado!");
    }

    if (game.id !== gamemode.gameId) {
      throw new FrompsBotError("O modo de jogo não corresponde ao jogo informado!");
    }

    await interaction.showModal(this.raceCreateModal.createModal(gamemode));
  }

  async raceCreateModalCallback(
    interaction: ModalSubmitInteraction,
    app: Application,
    gameModeId: number,
    seed: string,
    seedVerifier: string
  ) {

    const gameMode = (await app.services.game.getGameModeById(
      gameModeId, { include: ["game"] }
    )).value;
    if (!gameMode) {
      throw new FrompsBotError("Modo de jogo desconhecido!");
    }

    await app.services.race.createRace({
      game: gameMode.game as GameModel,
      gameMode,
      seed,
      seedVerifier
    });

    await interaction.reply({
      content: "Corrida criada com sucesso!",
      ephemeral: true
    });
  }

  private readonly gameAutocompleteField: GameAutocompleteField;
  private readonly gamemodeAutocompleteField: GameModeAutocompleteField;
  private readonly raceCreateModal: RaceCreateModal;
}
