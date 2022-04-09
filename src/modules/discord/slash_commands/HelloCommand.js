"use strict";

const BaseCommand = require("./BaseCommand");


module.exports = class NicknameCommand extends BaseCommand {
  constructor() {
    super("ola", "Diz 'olá' a um usuario.");

    this.builder.addUserOption(option =>
      option.setName("usuario")
        .setDescription("usuário alvo.")
    );
  }

  async execute(interaction) {
    let user = interaction.options.getUser("usuario");
    if (!user) {
      user = interaction.user;
    }

    await interaction.reply(`Olá <@${user.id}>!`);
  }
};
