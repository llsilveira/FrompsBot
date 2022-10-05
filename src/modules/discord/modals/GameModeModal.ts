import {
  ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder,
  ModalSubmitInteraction, TextInputBuilder, TextInputStyle
} from "discord.js";

import {
  type GameModeModel, GAMEMODE_MAX_NAME_LENGTH, GAMEMODE_MAX_DESCRIPTION_LENGTH,
  GAMEMODE_MAX_LONGDESCRIPTION_LENGTH
} from "../../../app/core/models/gameModeModel";

import { type InteractionHandlerOptions } from "../interaction/InteractionHandler";
import Application from "../../../app/Application";
import ModalSubmit from "../interaction/ModalSubmit";
import { GameModel } from "../../../app/core/models/gameModel";

export type GameModeModalCreateCallback = (
  interaction: ModalSubmitInteraction,
  app: Application,
  gameId: number,
  name: string,
  description: string,
  longDescription: string
) => unknown;

export type GameModeModalUpdateCallback = (
  interaction: ModalSubmitInteraction,
  app: Application,
  id: number,
  name: string,
  description: string,
  longDescription: string
) => unknown;

type GameModeModalSelector = "create" | "update"
type GameModeModalArguments = [GameModeModalSelector, number];

export default class GameModeModal extends ModalSubmit<GameModeModalArguments> {
  constructor(
    componentName: string,
    createCallback: GameModeModalCreateCallback,
    updateCallback: GameModeModalUpdateCallback,
    options: InteractionHandlerOptions = {}
  ) {
    super(componentName, options);
    this.createCallback = createCallback;
    this.updateCallack = updateCallback;
  }

  createModal(game: GameModel, gameMode?: GameModeModel) {

    const nameInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId("name")
      .setLabel("Nome")
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(GAMEMODE_MAX_NAME_LENGTH);

    const descriptionInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Paragraph)
      .setCustomId("description")
      .setLabel("Descrição")
      .setRequired(true)
      .setMaxLength(GAMEMODE_MAX_DESCRIPTION_LENGTH);

    const longDescriptionInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Paragraph)
      .setCustomId("longDescription")
      .setLabel("Descrição longa")
      .setRequired(true)
      .setMaxLength(GAMEMODE_MAX_LONGDESCRIPTION_LENGTH);

    const modal = new ModalBuilder();

    if (gameMode) {
      modal.setCustomId(this.generateCustomId(["update", gameMode.id]));
      modal.setTitle(`Alterando o modo ${gameMode.name}`);

      nameInput.setValue(gameMode.name);
      descriptionInput.setValue(gameMode.description);
      longDescriptionInput.setValue(gameMode.longDescription);
    } else {
      modal.setCustomId(this.generateCustomId(["create", game.id]));
      modal.setTitle(`Novo modo para ${game.code}`);
    }
    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput)
    );
    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(descriptionInput)
    );
    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(longDescriptionInput)
    );

    return modal;
  }

  async handleInteraction(
    interaction: ModalSubmitInteraction,
    app: Application
  ) {

    const name = interaction.fields.getTextInputValue("name");
    const description = interaction.fields.getTextInputValue("description");
    const longDescription = interaction.fields.getTextInputValue("longDescription");

    const [op, id] = this.getArguments(interaction.customId);
    if (op === "create") {
      await this.createCallback(interaction, app, id, name, description, longDescription);
    } else if (op === "update") {
      await this.updateCallack(interaction, app, id, name, description, longDescription);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustive_check: never = op;
      throw new Error("Unknown opration on GameModeModal");
    }
  }

  private readonly createCallback: GameModeModalCreateCallback;
  private readonly updateCallack: GameModeModalUpdateCallback;
}
