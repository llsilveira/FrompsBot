"use strict";

const { InteractionType } = require("discord.js");
const ApplicationCommand = require("./interaction/ApplicationCommand");
const AutocompleteField = require("./interaction/AutocompleteField");
const MessageComponent = require("./interaction/MessageComponent");

module.exports = class InteractionHandlerContainer {
  registerHandler(interactionHandler) {
    if (interactionHandler instanceof ApplicationCommand) {
      this.#registerApplicationCommand(interactionHandler);
    } else if (interactionHandler instanceof AutocompleteField) {
      this.#registerAutocompleteField(interactionHandler);
    } else if (interactionHandler instanceof MessageComponent) {
      this.#registerMessageComponent(interactionHandler);
    } else {
      throw new TypeError("Unrecognized interaction handler type");
    }
  }

  getHandlerFor(interaction) {
    const interactionType = interaction.type;
    if (interactionType === InteractionType.ApplicationCommand) {
      return this.#getApplicationCommandHandler(interaction);
    } else if (interactionType === InteractionType.ApplicationCommandAutocomplete) {
      return this.#getAutocompleteFieldHandler(interaction);
    } else if (interactionType === InteractionType.MessageComponent) {
      return this.#getMessageComponentHandler(interaction);
    } else {
      throw new Error(`Unrecognized interaction type: ${interactionType}`);
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

  #registerApplicationCommand(interactionHandler) {
    this.#containerSet(
      InteractionType.ApplicationCommand,
      interactionHandler.commandName,
      interactionHandler
    );
  }

  #getApplicationCommandHandler(interaction) {
    return this.#containerGet(
      InteractionType.ApplicationCommand, interaction.commandName
    );
  }

  #registerAutocompleteField(interactionHandler) {
    const key =
      `${interactionHandler.commandName}+${interactionHandler.fieldName}`;
    this.#containerSet(
      InteractionType.ApplicationCommandAutocomplete, key, interactionHandler
    );
  }

  #getAutocompleteFieldHandler(interaction) {
    const commandName = interaction.commandName;
    const fieldName = interaction.options.getFocused(true).name;
    const key = `${commandName}+${fieldName}`;

    return this.#containerGet(
      InteractionType.ApplicationCommandAutocomplete, key
    );
  }

  #registerMessageComponent(interactionHandler) {
    this.#containerSet(
      InteractionType.MessageComponent,
      interactionHandler.componentName,
      interactionHandler
    );
  }

  #getMessageComponentHandler(interaction) {
    const customId = interaction.customId;
    const key = MessageComponent.getComponentNameFromCustomId(customId);

    return this.#containerGet(InteractionType.MessageComponent, key);
  }

  #containerGet(interactionType, key) {
    const container = this.#containers[interactionType];
    return container.get(key) || null;
  }

  #containerSet(interactionType, key, value) {
    const container = this.#containers[interactionType];
    if (container.has(key)) {
      throw new Error(`This container already has a handler for '${key}'`);
    }
    container.set(key, value);
  }

  #containers = {
    [InteractionType.ApplicationCommand]: new Map(),
    [InteractionType.ApplicationCommandAutocomplete]: new Map(),
    [InteractionType.MessageComponent]: new Map()
  };
};
