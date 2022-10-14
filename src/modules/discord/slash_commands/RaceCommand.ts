import { ChatInputCommandInteraction } from "discord.js";
import Application from "../../../app/Application";
import FrompsBotError from "../../../errors/FrompsBotError";
import Discord from "../../Discord";
import GameAutocompleteField from "../autocomplete_fields/GameAutocompleteField";
import GameModeAutocompleteField from "../autocomplete_fields/GameModeAutocompleteField";
import ApplicationCommand from "../interaction/ApplicationCommand";

export default class RaceCommand extends ApplicationCommand {
  constructor(discord: Discord) {
    super("race", "Cria ou gerencia corridas.");

    this.gameAutocompleteField = new GameAutocompleteField(this, "game");
    this.gamemodeAutocompleteField = new GameModeAutocompleteField(
      this, "gamemode", this.gameAutocompleteField
    );

    discord.registerInteractionHandler(this.gameAutocompleteField);
    discord.registerInteractionHandler(this.gamemodeAutocompleteField);

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
    await interaction.deferReply({ ephemeral: true });

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

    await interaction.editReply({
      content: "WIP"
    });
  }

  private readonly gameAutocompleteField: GameAutocompleteField;
  private readonly gamemodeAutocompleteField: GameModeAutocompleteField;
}
