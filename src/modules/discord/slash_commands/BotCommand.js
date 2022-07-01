"use strict";


const { AccountProvider } = require("../../../constants");
const { FrompsBotError } = require("../../../errors");

const SlashCommandBase = require("../SlashCommandBase");


module.exports = class BotCommand extends SlashCommandBase {
  constructor() {
    super("bot", "Comandos para gerenciar este bot.");

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("add_admin")
        .setDescription("Adiciona um novo usuário no cargo de administrador deste bot")
        .addUserOption(option =>
          option.setName("user")
            .setDescription("Novo administrador.")
            .setRequired(true)
        )
    );

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("remove_admin")
        .setDescription("Remove um usuário do cargo de administrador deste bot")
        .addUserOption(option =>
          option.setName("user")
            .setDescription("Administrador a ser removido.")
            .setRequired(true)
        )
    );

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("add_monitor")
        .setDescription("Adiciona um usuário no cargo de monitor de um jogo")
        .addStringOption(option =>
          option.setName("game_code")
            .setDescription("Código do jogo. Ex: ALTTPR.")
            .setRequired(true)
        )
        .addUserOption(option =>
          option.setName("user")
            .setDescription("Novo monitor.")
            .setRequired(true)
        )
    );

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("remove_monitor")
        .setDescription("Remove um usuário do cargo de monitor de um jogo")
        .addStringOption(option =>
          option.setName("game_code")
            .setDescription("Código do jogo. Ex: ALTTPR.")
            .setRequired(true)
        )
        .addUserOption(option =>
          option.setName("user")
            .setDescription("Monitor a ser removido.")
            .setRequired(true)
        )
    );
  }

  async execute(interaction, controllers) {
    const command = interaction.options.getSubcommand();
    const gameCode = interaction.options.getString("game_code");
    const discordUser = interaction.options.getMember("user");

    let game, user;

    if (gameCode) {
      game = await controllers.game.getGameFromCode(gameCode);
      if (!game) {
        throw new FrompsBotError(
          `O codigo '${gameCode}' não corresponde a um jogo conhecido.`
        );
      }
    }

    if (discordUser) {
      user = await controllers.user.getOrRegister(
        AccountProvider.DISCORD, discordUser.id, discordUser.displayName
      );
    }

    let message;
    switch (command) {
    case "add_admin": {
      await controllers.bot.addAdmin(user);
      message = `${user.name} foi adicionado como administrador deste bot.`;
      break;
    }
    case "remove_admin": {
      await controllers.bot.removeAdmin(user);
      message = `${user.name} foi removido do cargo de administrador deste bot.`;
      break;
    }
    case "add_monitor": {
      await controllers.game.addMonitor(game, user);
      message = `${user.name} foi adicionado como monitor de ${game.shortName}.`;
      break;
    }
    case "remove_monitor": {
      await controllers.game.addMonitor(game, user);
      message = `${user.name} foi removido do cargo de monitor de ${game.shortName}.`;
      break;
    }
    }

    await interaction.reply({ content: message, ephemeral: true });
  }
};
