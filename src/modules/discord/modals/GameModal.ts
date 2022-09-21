import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";

import { type InteractionHandlerOptions } from "../interaction/InteractionHandler";
import Application from "../../../app/Application";
import ModalSubmit from "../interaction/ModalSubmit";
import {
  GameModel, GAME_MAX_CODE_LENGTH, GAME_MAX_NAME_LENGTH, GAME_MAX_SHORTNAME_LENGTH
} from "../../../app/core/models/gameModel";

export type GameModalCreateCallback = (
  interaction: ModalSubmitInteraction,
  app: Application,
  code: string,
  name: string,
  shortName?: string
) => unknown;

export type GameModalUpdateCallback = (
  interaction: ModalSubmitInteraction,
  app: Application,
  id: number,
  code: string,
  name: string,
  shortName?: string
) => unknown;

type GameModalArguments = number | undefined;

export default class GameModal extends ModalSubmit<GameModalArguments> {
  constructor(
    componentName: string,
    createCallback: GameModalCreateCallback,
    updateCallback: GameModalUpdateCallback,
    options: InteractionHandlerOptions = {}
  ) {
    super(componentName, options);
    this.createCallback = createCallback;
    this.updateCallack = updateCallback;
  }

  createModal(
    game?: GameModel
  ) {
    const codeInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId("code")
      .setLabel("Código (Ex: 'ALTTPR')")
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(GAME_MAX_CODE_LENGTH);

    const nameInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId("name")
      .setLabel("Nome")
      .setRequired(true)
      .setMinLength(5)
      .setMaxLength(GAME_MAX_NAME_LENGTH);

    const shortNameInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId("shortName")
      .setLabel("Nome curto (opicional)")
      .setRequired(false)
      .setMaxLength(GAME_MAX_SHORTNAME_LENGTH);

    const modal = new ModalBuilder();

    if (game) {
      modal.setCustomId(this.generateCustomId(game.id));
      modal.setTitle(`Alterando o jogo ${game.name}`);

      codeInput.setValue(game.code);
      nameInput.setValue(game.name);
      const shortName = game.getDataValue("shortName");
      shortName && shortNameInput.setValue(shortName);
    } else {
      modal.setCustomId(this.generateCustomId(undefined));
      modal.setTitle("Novo jogo");
    }

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(codeInput)
    );
    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput)
    );
    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(shortNameInput)
    );

    return modal;
  }

  async handleInteraction(
    interaction: ModalSubmitInteraction,
    app: Application
  ) {

    const code = interaction.fields.getTextInputValue("code");
    const name = interaction.fields.getTextInputValue("name");
    let shortName: string | undefined = interaction.fields.getTextInputValue("shortName");
    if (shortName.length === 0) { shortName = undefined; }

    const id = this.getArguments(interaction.customId);
    if (id === undefined) {
      await this.createCallback(interaction, app, code, name, shortName);
    } else {
      await this.updateCallack(interaction, app, id, code, name, shortName);
    }
  }

  private readonly createCallback: GameModalCreateCallback;
  private readonly updateCallack: GameModalUpdateCallback;
}
