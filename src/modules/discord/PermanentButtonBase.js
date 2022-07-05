"use strict";

const { MessageButton } = require("discord.js");


module.exports = class PermanentButtonBase {
  constructor(discord, controllers, name, options = {}) {
    this.#discord = discord;
    this.#controllers = controllers;
    this.#name = name;

    this.#options = options;
  }

  get discord() {
    return this.#discord;
  }

  get controllers() {
    return this.#controllers;
  }

  get name() {
    return this.#name;
  }

  create(customId) {
    return new MessageButton(
      Object.assign({ customId, ...this.#options })
    );
  }

  // eslint-disable-next-line no-unused-vars
  async execute(interaction, ...args) {
    /* override this */
    throw new Error(
      `execute method must be implemented by ${PermanentButtonBase.name} ` +
      " concrete subclasses."
    );
  }

  #discord;
  #controllers;
  #name;
  #options;
};
