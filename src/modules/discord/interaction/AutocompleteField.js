"use strict";

const { InteractionType } = require("discord.js");
const InteractionHandlerBase = require("./InteractionHandlerBase");

// TODO: method getFieldDef to return the option to include in the command builder

module.exports = class AutocompleteField extends InteractionHandlerBase {

  constructor(commandName, fieldName, options) {
    super(InteractionType.ApplicationCommand, options);

    this.#commandName = commandName;
    this.#fieldName = fieldName;
  }

  get commandName() {
    return this.#commandName;
  }

  get fieldName() {
    return this.#fieldName;
  }

  // abstract
  // eslint-disable-next-line no-unused-vars
  addTo(builder, description, isRequired) {
    throw new Error(
      `${this.addTo.name} method must be implemented by ` +
      `${AutocompleteField.name} concrete subclasses.`
    );
  }

  // abstract
  // eslint-disable-next-line no-unused-vars
  async getValue(interaction, context, options) {
    throw new Error(
      `${this.getValue.name} method must be implemented by ` +
      `${AutocompleteField.name} concrete subclasses.`
    );
  }

  // abstract method handleInteraction is not implemented.

  #commandName;
  #fieldName;
};
