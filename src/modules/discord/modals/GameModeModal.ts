import {
  ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder,
  ModalSubmitInteraction, TextInputBuilder, TextInputStyle
} from "discord.js";

import { type GameModeModel, GAMEMODE_MAX_NAME_LENGTH, GAMEMODE_MAX_DESCRIPTION_LENGTH } from "../../../core/models/gameModeModel";
import { type InteractionHandlerOptions } from "../interaction/InteractionHandler";
import ContextManager from "../../../core/modules/ContextManager";
import ModalSubmit from "../interaction/ModalSubmit";
import { GameModel } from "../../../core/models/gameModel";

export type GameModeModalCreateCallback = (
  interaction: ModalSubmitInteraction,
  context: ContextManager,
  gameId: number,
  name: string,
  description: string
) => unknown;

export type GameModeModalUpdateCallback = (
  interaction: ModalSubmitInteraction,
  context: ContextManager,
  id: number,
  name: string,
  description: string
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
      .setMinLength(5)
      .setMaxLength(GAMEMODE_MAX_NAME_LENGTH);

    const descriptionInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Paragraph)
      .setCustomId("description")
      .setLabel("Descrição")
      .setRequired(true)
      .setMaxLength(GAMEMODE_MAX_DESCRIPTION_LENGTH);

    const modal = new ModalBuilder();

    if (gameMode) {
      modal.setCustomId(this.generateCustomId(["update", gameMode.id]));
      modal.setTitle(`Alterando o modo ${gameMode.name}`);

      nameInput.setValue(gameMode.name);
      descriptionInput.setValue(gameMode.description);
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

    return modal;
  }

  async handleInteraction(
    interaction: ModalSubmitInteraction,
    context: ContextManager
  ) {

    const name = interaction.fields.getTextInputValue("name");
    const description = interaction.fields.getTextInputValue("description");

    const [op, id] = this.getArguments(interaction.customId);
    if (op === "create") {
      await this.createCallback(interaction, context, id, name, description);
    } else if (op === "update") {
      await this.updateCallack(interaction, context, id, name, description);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustive_check: never = op;
      throw new Error("Unknown opration on GameModeModal");
    }
  }

  private readonly createCallback: GameModeModalCreateCallback;
  private readonly updateCallack: GameModeModalUpdateCallback;
}
