"use strict";

const { EmbedBuilder } = require("discord.js");
const FrompsBotError = require("../../../errors/FrompsBotError");
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
      subcommand.setName("list_modes")
        .setDescription("Lista os modos cadastrados para um jogo")
        .addStringOption(option =>
          option.setName("code")
            .setDescription("Código do jogo. Ex: ALTTPR.")
            .setRequired(true)
        )
        .addBooleanOption(option =>
          option.setName("include_all")
            .setDescription("Incluir todos os modos (inclusive desativados).")
        )
    );

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("add_mode")
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
            .setDescription("Descrição do modo (máximo 80 caracteres).")
            .setRequired(true)
        )
    );

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("remove_mode")
        .setDescription("Remove um modo de um jogo")
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
    );
  }

  async handleList(interaction) {
    const games = await this.discord.app.services.game.list();
    let codes = "";
    let names = "";

    games.sort((a, b) => a.shortName < b.shortName ? -1 : 1).forEach(game => {
      codes += `${game.code}\n`;
      names += `${game.shortName}\n`;
    });

    const embed = new EmbedBuilder().setTitle("Jogos cadastrados");
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
  }

  async handleAdd(interaction) {
    const code = interaction.options.getString("code");
    const name = interaction.options.getString("name");
    const shortName = interaction.options.getString("short_name");

    await this.discord.app.services.game.create(code, name, shortName);
    await interaction.reply({
      content: `O jogo '${name}' foi adicionado com sucesso!`,
      ephemeral: true
    });
  }

  async handleRemove(interaction) {
    const code = interaction.options.getString("code");

    const game = await this.discord.app.services.game.remove(code);
    await interaction.reply({
      content: `O jogo '${game.name}' foi removido!`,
      ephemeral: true
    });
  }

  async handleListModes(interaction) {
    const code = interaction.options.getString("code");
    const includeAll = interaction.options.getBoolean("include_all");

    const game = await this.discord.app.services.game.getFromCode(
      code, { includeModes: true }
    );
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    const modes = includeAll ? game.modes : game.modes.filter(
      mode => !(mode.data?.disabled)
    );

    const embed = new EmbedBuilder().setTitle(`${game.code} - Modos de jogo`);
    let description = `Modos de jogo de ${game.shortName}:`;

    if (modes.length > 0) {
      embed.addFields(modes.sort((a, b) => a.name < b.name ? -1 : 1)
        .map(mode => ({
          name: mode.name,
          value: mode.description
        }))
      );
    } else {
      description += "\n\n**Nenhum modo encontrado para este jogo!**";
    }
    embed.setDescription(description);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  async handleAddMode(interaction) {
    const code = interaction.options.getString("code");
    const name = interaction.options.getString("name");
    const description = interaction.options.getString("description");

    const game = await this.discord.app.services.game.getFromCode(code);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    await this.discord.app.services.game.createMode(game, name, description);
    await interaction.reply({
      content: `O modo '${name}' foi criado com sucesso!`,
      ephemeral: true
    });
  }

  async handleRemoveMode(interaction) {
    const code = interaction.options.getString("code");
    const name = interaction.options.getString("name");

    const game = await this.discord.app.services.game.getFromCode(code);
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    await this.discord.app.services.game.removeMode(game, name);
    await interaction.reply({
      content: `O modo '${name}' foi removido de ${game.shortName}!`,
      ephemeral: true
    });
  }

  async execute(interaction) {
    const command = interaction.options.getSubcommand();
    switch (command) {
    case "list": {
      await this.handleList(interaction);
      break;
    }
    case "add": {
      await this.handleAdd(interaction);
      break;
    }
    case "remove": {
      await this.handleRemove(interaction);
      break;
    }
    case "list_modes": {
      await this.handleListModes(interaction);
      break;
    }
    case "add_mode": {
      await this.handleAddMode(interaction);
      break;
    }
    case "remove_mode": {
      await this.handleRemoveMode(interaction);
      break;
    }
    }
  }
};
