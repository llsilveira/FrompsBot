import { ChatInputCommandInteraction } from "discord.js";
import AccountProvider from "../../../constants/AccountProvider";
import Application from "../../../app/Application";
import FrompsBotError from "../../../errors/FrompsBotError";
import ApplicationCommand from "../interaction/ApplicationCommand";

export default class NicknameCommand extends ApplicationCommand {
  constructor() {
    super("nickname", "Mostra ou altera o apelido de um usuário");

    this.builder.addStringOption(option =>
      option.setName("new_nick")
        .setDescription("Novo apelido. Deixe em branco se quiser apenas mostrar o apelido atual.")
    );

    this.builder.addUserOption(option =>
      option.setName("user")
        .setDescription("Selecione o usuário. Deixe em branco para alterar/mostrar seu próprio apelido.")
    );
  }

  async handleInteraction(
    interaction: ChatInputCommandInteraction,
    app: Application
  ) {
    const discordUser = interaction.options.getUser("user");
    const name = interaction.options.getString("new_nick");

    const {
      auth: authService,
      user: userService
    } = app.services;

    let user, sameUser;
    if (!discordUser || discordUser.id == interaction.user.id) {
      user = authService.getLoggedUser(true).value;
      sameUser = true;
    } else {
      user = (await userService.getUserFromProvider(
        AccountProvider.DISCORD, discordUser.id
      )).value;
      if (!user) {
        // TODO: change type
        throw new FrompsBotError("Usuário não encontrado!");
      }
      sameUser = false;
    }

    let message = sameUser ? "O seu apelido " : `O apelido de '${user.name}' `;
    if (name) {
      await userService.setName(user, name);
      message += `foi alterado para '${name}'.`;
    } else {
      message += `é '${user.name}'.`;
    }

    await interaction.reply({
      content: message,
      ephemeral: true
    });
  }
}
