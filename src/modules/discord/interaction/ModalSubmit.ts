import { InteractionType } from "discord.js";
import ComponentInteractionHandler from "./ComponentInteractionHandler";
import { InteractionHandlerOptions } from "./InteractionHandler";


export default abstract class ModalSubmit
  extends ComponentInteractionHandler<InteractionType.ModalSubmit> {

  constructor(componentName: string, options?: InteractionHandlerOptions) {
    super(InteractionType.ModalSubmit, componentName, options);
  }
}
