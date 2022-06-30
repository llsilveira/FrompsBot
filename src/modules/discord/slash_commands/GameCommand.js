"use strict";

const SlashCommandBase = require("../SlashCommandBase");

module.exports = class GameCommand extends SlashCommandBase {
  constructor() {
    super("game", "Gerencia os jogos cadastrados no bot.");

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("add")
        .setDescription("Adiciona um novo jogo")
        .addStringOption(option =>
          option.setName("code")
            .setDescription("Código do jogo. Ex: ALTTPR.")
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("name")
            .setDescription("Nome do jogo.")
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("short_name")
            .setDescription("Nome curto (máximo 32 caracteres).")
        )
    );

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("addmode")
        .setDescription("Adiciona um novo modo para um jogo")
        .addStringOption(option =>
          option.setName("code")
            .setDescription("Código do jogo. Ex: ALTTPR.")
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("name")
            .setDescription("Nome do modo de jogo.")
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("description")
            .setDescription("Descrição do modo.")
            .setRequired(true)
        )
    );
  }

  async execute(interaction, controllers) {
    const command = interaction.options.getSubcommand();
    switch (command) {
    case "add": {
      const code = interaction.options.getString("code");
      const name = interaction.options.getString("name");
      const shortName = interaction.options.getString("short_name");

      await controllers.game.create(code, name, shortName);
      await interaction.reply(`O jogo '${name}' foi adicionado com sucesso!`);
      break;
    }
    case "addmode": {
      const code = interaction.options.getString("code");
      const name = interaction.options.getString("name");
      const description = interaction.options.getString("description");

      await controllers.game.createMode(code, name, { description });
      await interaction.reply(`O modo '${name}' foi criado com sucesso!`);
      break;
    }
    }
  }
};
