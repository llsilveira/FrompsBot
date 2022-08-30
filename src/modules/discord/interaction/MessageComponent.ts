import { InteractionType } from "discord.js";
import { JSONSerializable } from "../../../core/type";
import ComponentInteractionHandler from "./ComponentInteractionHandler";
import { InteractionHandlerOptions } from "./InteractionHandler";


export default abstract class MessageComponent<
  ArgsType extends JSONSerializable | undefined = JSONSerializable | undefined
> extends ComponentInteractionHandler<InteractionType.MessageComponent, ArgsType> {

  constructor(componentName: string, options?: InteractionHandlerOptions) {
    super(InteractionType.MessageComponent, componentName, options);
  }
}
