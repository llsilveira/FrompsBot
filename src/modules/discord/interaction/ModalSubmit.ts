import { InteractionType } from "discord.js";
import { JSONSerializable } from "../../../core/type";
import ComponentInteractionHandler from "./ComponentInteractionHandler";
import { InteractionHandlerOptions } from "./InteractionHandler";


export default abstract class ModalSubmit<
  ArgsType extends JSONSerializable | undefined = JSONSerializable | undefined
> extends ComponentInteractionHandler<InteractionType.ModalSubmit, ArgsType> {

  constructor(componentName: string, options?: InteractionHandlerOptions) {
    super(InteractionType.ModalSubmit, componentName, options);
  }
}
