"use strict";

const { ButtonBuilder } = require("discord.js");
const MessageComponent = require("../interaction/MessageComponent");


module.exports = class PermanentButton extends MessageComponent {
  constructor(componentName, buttonCallback, options = {}) {
    super(componentName, options);
    this.#options = options;
    this.#buttonCallback = buttonCallback;
  }

  createButton(options = {}, args) {
    const fullOptions = Object.assign({
      customId: this.generateCustomId(args),
      ...this.#options
    }, options);
    return new ButtonBuilder(fullOptions);
  }

  async handleInteraction(interaction, context) {
    await this.#buttonCallback(
      interaction, context, this.getArguments(interaction)
    );
  }

  #options;
  #buttonCallback;
};
