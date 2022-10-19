import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";

import { type InteractionHandlerOptions } from "../interaction/InteractionHandler";
import Application from "../../../app/Application";
import ModalSubmit from "../interaction/ModalSubmit";
import { GameModeModel } from "../../../app/core/models/gameModeModel";

export type RaceCreateModalCallback = (
  interaction: ModalSubmitInteraction,
  app: Application,
  gameModeId: number,
  seed: string,
  seedVerifier: string
) => unknown;

type RaceCreateModalArguments = number;

export default class RaceCreateModal extends ModalSubmit<RaceCreateModalArguments> {
  constructor(
    componentName: string,
    callback: RaceCreateModalCallback,
    options: InteractionHandlerOptions = {}
  ) {
    super(componentName, options);
    this.callback = callback;
  }

  createModal(gameMode: GameModeModel) {
    const seedInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Paragraph)
      .setCustomId("seed")
      .setLabel("Seed")
      .setRequired(true);

    const seedVerifier = new TextInputBuilder()
      .setStyle(TextInputStyle.Paragraph)
      .setCustomId("seedVerifier")
      .setLabel("Código Verificador")
      .setRequired(true);

    const modal = new ModalBuilder();

    modal.setTitle("Nova corrida");
    modal.setCustomId(this.generateCustomId(gameMode.id));

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(seedInput)
    );
    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(seedVerifier)
    );

    return modal;
  }

  async handleInteraction(
    interaction: ModalSubmitInteraction,
    app: Application
  ) {

    const seed = interaction.fields.getTextInputValue("seed");
    const seedVerifier = interaction.fields.getTextInputValue("seedVerifier");

    const id = this.getArguments(interaction.customId);
    await this.callback(interaction, app, id, seed, seedVerifier);
  }

  private readonly callback: RaceCreateModalCallback;
}
