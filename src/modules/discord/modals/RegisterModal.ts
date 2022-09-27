import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { InteractionHandlerOptions } from "../interaction/InteractionHandler";
import ModalSubmit from "../interaction/ModalSubmit";

import { USER_MAX_NAME_LENGTH } from "../../../app/core/models/userModel";
import Application from "../../../app/Application";


export type RegisterModalSubmitCallback = (
  interaction: ModalSubmitInteraction,
  app: Application,
  discordId: string,
  nickname: string
) => unknown;

type RegisterArguments = string;

export default class RegisterModal extends ModalSubmit<RegisterArguments> {
  constructor(
    componentName: string,
    submitCallback: RegisterModalSubmitCallback,
    options: InteractionHandlerOptions = {}
  ) {
    super(componentName, options);
    this.submitCallback = submitCallback;
  }

  createModal(discordId: string) {
    const nicknameInput = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setCustomId("nickname")
      .setLabel("Seu apelido")
      .setMinLength(3)
      .setMaxLength(USER_MAX_NAME_LENGTH);

    const modal = new ModalBuilder();
    modal.setCustomId(this.generateCustomId(discordId));
    modal.setTitle("Novo Registro");

    modal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(nicknameInput)
    );

    return modal;
  }

  async handleInteraction(
    interaction: ModalSubmitInteraction, app: Application
  ) {
    const discordId = this.getArguments(interaction.customId);
    const nickname = interaction.fields.getTextInputValue("nickname");
    await this.submitCallback(interaction, app, discordId, nickname);
  }

  private readonly submitCallback: RegisterModalSubmitCallback;
}
