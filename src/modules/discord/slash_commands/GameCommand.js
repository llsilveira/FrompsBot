"use strict";

const { MessageEmbed } = require("discord.js");
const SlashCommandBase = require("../SlashCommandBase");

module.exports = class GameCommand extends SlashCommandBase {
  constructor(discord) {
    super(discord, "game", "Gerencia os jogos cadastrados no bot.");

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("list")
        .setDescription(
          "Lista os jogos cadastrados no bot juntamente com seus " +
          "respectivos códigos"
        )
    );

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
      subcommand.setName("remove")
        .setDescription("Remove um jogo")
        .addStringOption(option =>
          option.setName("code")
            .setDescription("Código do jogo. Ex: ALTTPR.")
            .setRequired(true)
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

  async execute(interaction) {
    const command = interaction.options.getSubcommand();
    switch (command) {
    case "list": {
      const games = await this.discord.controllers.game.list();
      let codes = "";
      let names = "";

      games.sort((a, b) => a.shortName < b.shortName ? -1 : 1).forEach(game => {
        codes += `${game.code}\n`;
        names += `${game.shortName}\n`;
      });

      const embed = new MessageEmbed().setTitle("Jogos cadastrados");
      const description = "Lista de jogos e seus respectivos códigos";

      if (games.length > 0) {
        embed.setDescription(description).addFields(
          { name: "Jogo", value: names, inline: true },
          { name: "Código", value: codes, inline: true }
        );
      } else {
        embed.setDescription(
          description + "\n\n**Nenhum jogo foi cadastrado ainda!**");
      }

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
      break;
    }
    case "remove": {
      const code = interaction.options.getString("code");

      const game = await this.discord.controllers.game.remove(code);
      await interaction.reply(`O jogo '${game.name}' foi removido!`);
      break;
    }
    case "add": {
      const code = interaction.options.getString("code");
      const name = interaction.options.getString("name");
      const shortName = interaction.options.getString("short_name");

      await this.discord.controllers.game.create(code, name, shortName);
      await interaction.reply(`O jogo '${name}' foi adicionado com sucesso!`);
      break;
    }
    case "addmode": {
      const code = interaction.options.getString("code");
      const name = interaction.options.getString("name");
      const description = interaction.options.getString("description");

      await this.discord.controllers.game.createMode(code, name, { description });
      await interaction.reply(`O modo '${name}' foi criado com sucesso!`);
      break;
    }
    }
  }
};
