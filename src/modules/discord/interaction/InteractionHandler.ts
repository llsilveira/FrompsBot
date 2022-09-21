import type { Interaction, InteractionType } from "discord.js";
import Application from "../../../app/Application";


export interface InteractionHandlerOptions {
  annonymous?: boolean
}

export type InteractionTypeHandled<IType extends InteractionType> = Interaction & {
  type: IType
};

export default abstract class InteractionHandler<
  IType extends InteractionType = InteractionType
> {

  constructor(
    interactionType: IType,
    options: InteractionHandlerOptions = {}
  ) {
    const { annonymous = false } = options;

    this.interactionType = interactionType;
    this.options = Object.freeze({
      annonymous
    });
  }

  abstract handleInteraction(
    interaction: InteractionTypeHandled<IType>,
    app: Application
  ): void | Promise<void>;

  readonly interactionType: IType;
  readonly options: InteractionHandlerOptions;
}
