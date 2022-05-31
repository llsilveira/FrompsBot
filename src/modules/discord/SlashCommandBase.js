"use strict";


const { SlashCommandBuilder } = require("@discordjs/builders");


module.exports = class SlashCommandBase {
  constructor(name, description) {
    this.#name = name;
    this.#description = description;

    this.#builder = new SlashCommandBuilder()
      .setName(this.#name)
      .setDescription(this.#description);
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

  async execute() {
    /* override this */
  }

  #name;
  #description;

  #builder;
};
