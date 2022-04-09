"use strict";


const { SlashCommandBuilder } = require("@discordjs/builders");


module.exports = class BaseCommand {
  constructor(name, description, { anonymous = false } = {}) {
    this.name = name;
    this.description = description;
    this.anonymous = anonymous;

    this.builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }

  get definition() {
    return this.builder.toJSON();
  }

  async execute() {
    /* override this */
  }
};
