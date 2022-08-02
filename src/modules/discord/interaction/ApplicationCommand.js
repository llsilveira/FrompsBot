"use strict";


const { SlashCommandBuilder } = require("@discordjs/builders");
const { InteractionType } = require("discord.js");
const InteractionHandlerBase = require("./InteractionHandlerBase");


module.exports = class ApplicationCommand extends InteractionHandlerBase {
  constructor(commandName, commandDescription, options) {
    super(InteractionType.ApplicationCommand, options);

    this.#commandName = commandName;

    this.#builder = new SlashCommandBuilder()
      .setName(this.#commandName)
      .setDescription(commandDescription);
  }

  get commandName() {
    return this.#commandName;
  }

  get builder() {
    return this.#builder;
  }

  // abstract method handleInteraction is not implemented.

  #commandName;
  #builder;
};
