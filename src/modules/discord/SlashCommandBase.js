"use strict";


const { SlashCommandBuilder } = require("@discordjs/builders");


module.exports = class SlashCommandBase {
  constructor(discord, name, description) {
    this.#discord = discord;
    this.#name = name;
    this.#description = description;

    this.#builder = new SlashCommandBuilder()
      .setName(this.#name)
      .setDescription(this.#description);
  }

  get discord() {
    return this.#discord;
  }

  get name() {
    return this.#name;
  }

  get description() {
    return this.#description;
  }

  get builder() {
    return this.#builder;
  }

  get definition() {
    return this.#builder.toJSON();
  }

  // eslint-disable-next-line no-unused-vars
  async execute(interaction) {
    /* override this */
    throw new Error(
      `execute method must be implemented by ${SlashCommandBase.name} ` +
      " concrete subclasses."
    );
  }

  #discord;
  #name;
  #description;

  #builder;
};
