"use strict";


const { SlashCommandBuilder } = require("@discordjs/builders");


module.exports = class BaseCommand {
  constructor(discord, name, description) {
    this.discord = discord;
    this.name = name;
    this.description = description;

    this.builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }

  get app() {
    return this.discord.app;
  }

  get definition() {
    return this.builder.toJSON();
  }

  async execute() {
    /* override this */
  }
};
