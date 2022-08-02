"use strict";

const { InteractionType } = require("discord.js");

module.exports = class InteractionHandlerBase {

  constructor(interactionType, { annonymous = false } = {}) {

    if (!(interactionType in InteractionType)) {
      throw new Error(`Unrecognized interaction type: '${interactionType}'`);
    }
    this.#interactionType = interactionType;
    this.#options = Object.freeze({
      annonymous
    });
  }

  get interactionType() {
    return this.#interactionType;
  }

  get options() {
    return this.#options;
  }

  // abstract
  // eslint-disable-next-line no-unused-vars
  async handleInteraction(interaction, context) {
    throw new Error(
      `${this.handleInteraction.name} method must be implemented by ` +
      `${InteractionHandlerBase.name} concrete subclasses.`
    );
  }

  #interactionType;
  #options;
};
