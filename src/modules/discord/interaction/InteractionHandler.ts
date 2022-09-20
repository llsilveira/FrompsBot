import type { Interaction, InteractionType } from "discord.js";
import ContextManager from "../../ContextManager";


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
    context: ContextManager
  ): void | Promise<void>;

  readonly interactionType: IType;
  readonly options: InteractionHandlerOptions;
}
