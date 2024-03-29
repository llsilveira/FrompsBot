import {
  ButtonBuilder, InteractionButtonComponentData, MessageComponentInteraction
} from "discord.js";

import { type InteractionHandlerOptions } from "../interaction/InteractionHandler";
import Application from "../../../app/Application";
import MessageComponent from "../interaction/MessageComponent";
import { JSONSerializable } from "../../../app/core/type";

export type PermanentButtonCallback<
  ArgsType extends JSONSerializable | undefined
> = (
  interaction: MessageComponentInteraction,
  app: Application,
  args: ArgsType
) => unknown;

interface ButtonOptions
  extends Partial<Exclude<InteractionButtonComponentData, "customId">> {}

export interface PermanentButtonOptions
  extends ButtonOptions, InteractionHandlerOptions {}

export default class PermanentButton<
  ArgsType extends JSONSerializable | undefined
> extends MessageComponent<ArgsType> {
  constructor(
    componentName: string,
    buttonCallback: PermanentButtonCallback<ArgsType>,
    options: PermanentButtonOptions = {}
  ) {
    super(componentName, options);
    this.#options = options;
    this.#buttonCallback = buttonCallback;
  }

  createButton(
    options: ButtonOptions,
    args: ArgsType
  ) {
    const fullOptions = Object.assign({
      customId: this.generateCustomId(args),
      ...this.#options
    }, options);
    return new ButtonBuilder(fullOptions);
  }

  async handleInteraction(
    interaction: MessageComponentInteraction,
    app: Application
  ) {
    await this.#buttonCallback(
      interaction, app, this.getArguments(interaction.customId)
    );
  }

  #options;
  #buttonCallback;
}
