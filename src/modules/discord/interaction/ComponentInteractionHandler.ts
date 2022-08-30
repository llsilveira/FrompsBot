import { InteractionType } from "discord.js";
import { JSONSerializable } from "../../../core/type";
import InteractionHandler, { InteractionHandlerOptions } from "./InteractionHandler";


const CUSTOMID_PREFIX = "mcomp";
const FIELD_SEPARATOR = "$";

export default abstract class ComponentInteractionHandler<
  IType extends InteractionType.MessageComponent | InteractionType.ModalSubmit,
  ArgsType extends JSONSerializable | undefined
> extends InteractionHandler<IType> {

  static getComponentNameFromCustomId(customId: string): string | null {
    const prefix = CUSTOMID_PREFIX + FIELD_SEPARATOR;

    if (!customId.startsWith(prefix)) { return null; }

    const separatorIndex =
      customId.substring(prefix.length).indexOf(FIELD_SEPARATOR);

    if (separatorIndex < 0) { return null; }

    return customId.substring(prefix.length, prefix.length + separatorIndex);
  }

  constructor(
    interactionType: IType,
    componentName: string, options?: InteractionHandlerOptions) {
    super(interactionType, options);

    if (componentName.indexOf(FIELD_SEPARATOR) >= 0) {
      throw new Error(
        `componentName cannot contain the field separator '${FIELD_SEPARATOR}'.`
      );
    }

    this.componentName = componentName;
  }

  generateCustomId(args: ArgsType) {
    const argsStr = (args === undefined) ? "" : JSON.stringify(args);

    const value =
      CUSTOMID_PREFIX + FIELD_SEPARATOR +
      this.componentName + FIELD_SEPARATOR +
      argsStr;

    if (value.length > 100) {
      throw new Error("generated customId is more than 100 characters long.");
    }

    return value;
  }

  getArguments(customId: string): ArgsType {
    const index = CUSTOMID_PREFIX.length + FIELD_SEPARATOR.length +
      this.componentName.length + FIELD_SEPARATOR.length;

    const argsStr = customId.substring(index);
    if (argsStr.length === 0) { return undefined as ArgsType; }

    return JSON.parse(argsStr) as ArgsType;
  }

  // abstract handleInteraction from InteractionHandler

  readonly componentName;
}
