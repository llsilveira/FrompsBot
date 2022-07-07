"use strict";


const { AccountProvider } = require("../../../constants");
const { FrompsBotError } = require("../../../errors");

const SlashCommandBase = require("../SlashCommandBase");


module.exports = class NicknameCommand extends SlashCommandBase {
  constructor(discord) {
    super(discord, "nickname", "Mostra ou altera o apelido de um usuário");

    this.builder.addStringOption(option =>
      option.setName("new_nick")
        .setDescription("Novo apelido. Deixe em branco se quiser apenas mostrar o apelido atual.")
    );

    this.builder.addUserOption(option =>
      option.setName("user")
        .setDescription("Selecione o usuário. Deixe em branco para alterar/mostrar seu próprio apelido.")
    );
  }

  async execute(interaction) {
    const discordUser = interaction.options.getUser("user");
    const name = interaction.options.getString("new_nick");

    let user, sameUser;
    if (!discordUser || discordUser.id == interaction.user.id) {
      user = this.discord.app.services.auth.getLoggedUser();
      sameUser = true;
    } else {
      user = await this.discord.app.services.user.getFromProvider(AccountProvider.DISCORD, discordUser.id);
      if (!user) {
        // TODO: change type
        throw new FrompsBotError("Usuário não encontrado!");
      }
      sameUser = false;
    }

    let message = sameUser ? "O seu apelido " : `O apelido de '${user.name}' `;
    if (name) {
      await this.discord.app.services.user.setName(user, name);
      message += `foi alterado para '${name}'.`;
    } else {
      message += `é '${user.name}'.`;
    }

    await interaction.reply({
      content: message,
      ephemeral: true
    });
  }
};
