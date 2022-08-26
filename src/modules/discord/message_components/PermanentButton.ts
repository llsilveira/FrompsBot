import {
  ButtonBuilder, InteractionButtonComponentData, MessageComponentInteraction
} from "discord.js";

import { type InteractionHandlerOptions } from "../interaction/InteractionHandler";
import ContextManager from "../../../core/modules/ContextManager";
import MessageComponent from "../interaction/MessageComponent";
import { JSONSerializable } from "../../../core/type";

export type PermanentButtonCallback = (
  interaction: MessageComponentInteraction,
  context: ContextManager,
  args?: JSONSerializable
) => unknown;

export interface PermanentButtonOptions extends
  Partial<Exclude<InteractionButtonComponentData, "customId">>,
  InteractionHandlerOptions {}

export default class PermanentButton extends MessageComponent {
  constructor(
    componentName: string,
    buttonCallback: PermanentButtonCallback,
    options: PermanentButtonOptions = {}
  ) {
    super(componentName, options);
    this.#options = options;
    this.#buttonCallback = buttonCallback;
  }

  createButton(
    options: Partial<Exclude<InteractionButtonComponentData, "customId">> = {},
    args: JSONSerializable
  ) {
    const fullOptions = Object.assign({
      customId: this.generateCustomId(args),
      ...this.#options
    }, options);
    return new ButtonBuilder(fullOptions);
  }

  async handleInteraction(
    interaction: MessageComponentInteraction,
    context: ContextManager
  ) {
    await this.#buttonCallback(
      interaction, context, this.getArguments(interaction.customId)
    );
  }

  #options;
  #buttonCallback;
}
