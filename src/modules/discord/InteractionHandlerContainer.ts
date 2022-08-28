import {
  AutocompleteInteraction, CommandInteraction, Interaction, InteractionType,
  MessageComponentInteraction,
  ModalSubmitInteraction
} from "discord.js";

import ApplicationCommand from "./interaction/ApplicationCommand";
import AutocompleteField from "./interaction/AutocompleteField";
import InteractionHandler from "./interaction/InteractionHandler";
import MessageComponent from "./interaction/MessageComponent";
import ModalSubmit from "./interaction/ModalSubmit";


type MapTypes = {
  [InteractionType.ApplicationCommand]: ApplicationCommand,
  [InteractionType.ApplicationCommandAutocomplete]: AutocompleteField,
  [InteractionType.MessageComponent]: MessageComponent,
  [InteractionType.ModalSubmit]: ModalSubmit
};

export type InteractionHandlerContainerTypes = keyof MapTypes;

type ContainersType = {
  [Key in InteractionHandlerContainerTypes]: Map<string, MapTypes[Key]>
}

export default class InteractionHandlerContainer {
  registerHandler(interactionHandler: InteractionHandler) {
    if (interactionHandler instanceof ApplicationCommand) {
      this.#registerApplicationCommand(interactionHandler);
    } else if (interactionHandler instanceof AutocompleteField) {
      this.#registerAutocompleteField(interactionHandler);
    } else if (interactionHandler instanceof MessageComponent) {
      this.#registerMessageComponent(interactionHandler);
    } else if (interactionHandler instanceof ModalSubmit) {
      this.#registerModalSubmit(interactionHandler);
    } else {
      throw new TypeError("Unrecognized interaction handler type");
    }
  }

  getHandlerFor(interaction: Interaction) {
    const interactionType = interaction.type;
    if (interactionType === InteractionType.ApplicationCommand) {
      return this.#getApplicationCommandHandler(interaction);
    } else if (interactionType === InteractionType.ApplicationCommandAutocomplete) {
      return this.#getAutocompleteFieldHandler(interaction);
    } else if (interactionType === InteractionType.MessageComponent) {
      return this.#getMessageComponentHandler(interaction);
    } else if (interactionType === InteractionType.ModalSubmit) {
      return this.#getModalSubmitHandler(interaction);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const exhaustiveCheck: never = interactionType;
      throw new TypeError("Unrecognized interaction type");
    }
  }

  getApplicationCommands() {
    const commandContainer =
      this.#containers[InteractionType.ApplicationCommand];
    return commandContainer.values();
  }

  getAutocompleteFields() {
    const commandContainer =
      this.#containers[InteractionType.ApplicationCommandAutocomplete];
    return commandContainer.values();
  }

  getMessageComponents() {
    const commandContainer =
      this.#containers[InteractionType.MessageComponent];
    return commandContainer.values();
  }

  getModalSubmits() {
    const commandContainer =
      this.#containers[InteractionType.ModalSubmit];
    return commandContainer.values();
  }

  #registerApplicationCommand(interactionHandler: ApplicationCommand) {
    this.#containerSet(
      InteractionType.ApplicationCommand,
      interactionHandler.commandName,
      interactionHandler
    );
  }

  #getApplicationCommandHandler(interaction: CommandInteraction) {
    return this.#containerGet(
      InteractionType.ApplicationCommand, interaction.commandName
    );
  }

  #registerAutocompleteField(interactionHandler: AutocompleteField) {
    const key =
      `${interactionHandler.commandName}+${interactionHandler.fieldName}`;
    this.#containerSet(
      InteractionType.ApplicationCommandAutocomplete, key, interactionHandler
    );
  }

  #getAutocompleteFieldHandler(interaction: AutocompleteInteraction) {
    const commandName = interaction.commandName;
    const fieldName = interaction.options.getFocused(true).name;
    const key = `${commandName}+${fieldName}`;

    return this.#containerGet(
      InteractionType.ApplicationCommandAutocomplete, key
    );
  }

  #registerMessageComponent(interactionHandler: MessageComponent) {
    this.#containerSet(
      InteractionType.MessageComponent,
      interactionHandler.componentName,
      interactionHandler
    );
  }

  #getMessageComponentHandler(interaction: MessageComponentInteraction) {
    const customId = interaction.customId;
    const key = MessageComponent.getComponentNameFromCustomId(customId) || "";

    return this.#containerGet(InteractionType.MessageComponent, key);
  }

  #registerModalSubmit(interactionHandler: ModalSubmit) {
    this.#containerSet(
      InteractionType.ModalSubmit,
      interactionHandler.componentName,
      interactionHandler
    );
  }

  #getModalSubmitHandler(interaction: ModalSubmitInteraction) {
    const customId = interaction.customId;
    const key = MessageComponent.getComponentNameFromCustomId(customId) || "";

    return this.#containerGet(InteractionType.MessageComponent, key);
  }

  #containerGet(
    interactionType: InteractionHandlerContainerTypes,
    key: string
  ) {
    const container = this.#containers[interactionType];
    return container.get(key) || null;
  }

  #containerSet<T extends InteractionHandlerContainerTypes>(
    interactionType: T,
    key: string,
    value: MapTypes[T]
  ) {
    const container = this.#containers[interactionType];
    if (container.has(key)) {
      throw new Error(`This container already has a handler for '${key}'`);
    }
    container.set(key, value);
  }

  #containers: ContainersType = {
    [InteractionType.ApplicationCommand]: new Map(),
    [InteractionType.ApplicationCommandAutocomplete]: new Map(),
    [InteractionType.MessageComponent]: new Map(),
    [InteractionType.ModalSubmit]: new Map()
  };
}
