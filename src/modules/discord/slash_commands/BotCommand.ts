import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import AccountProvider from "../../../core/constants/AccountProvider";
import ContextManager from "../../../core/modules/ContextManager";
import FrompsBotError from "../../../errors/FrompsBotError";
import Discord from "../../Discord";
import GameAutocompleteField from "../autocomplete_fields/GameAutocompleteField";
import ApplicationCommand from "../interaction/ApplicationCommand";


export default class BotCommand extends ApplicationCommand {
  constructor(discord: Discord) {
    super("bot", "Comandos de gerenciamento do bot.");

    this.#gameField = new GameAutocompleteField(this, "game");
    discord.registerInteractionHandler(this.#gameField);

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("list_admins")
        .setDescription("Lista os administradores deste bot")
    );

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

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("list_monitors")
        .setDescription("Lista todos os monitores de um jogo");
      this.#gameField.addTo(subcommand, "Selecione o jogo", true);
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("add_monitor")
        .setDescription("Adiciona um usuário no cargo de monitor de um jogo")
        .addUserOption(option =>
          option.setName("user")
            .setDescription("Novo monitor.")
            .setRequired(true)
        );
      this.#gameField.addTo(subcommand, "Selecione o jogo", true);
      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("remove_monitor")
        .setDescription("Remove um usuário do cargo de monitor de um jogo")
        .addUserOption(option =>
          option.setName("user")
            .setDescription("Monitor a ser removido.")
            .setRequired(true)
        );
      this.#gameField.addTo(subcommand, "Selecione o jogo", true);
      return subcommand;
    });
  }

  async handleInteraction(
    interaction: ChatInputCommandInteraction,
    context: ContextManager
  ) {
    const command = interaction.options.getSubcommand();
    const discordUser = interaction.options.getMember("user") as GuildMember;

    const { bot: botService, user: userService } = context.app.services;

    const user = discordUser ?
      await userService.getOrRegister(
        AccountProvider.DISCORD, discordUser.id, discordUser.displayName
      ) : null;

    const game = await this.#gameField.getValue(interaction, context);

    let message;
    switch (command) {
    case "list_admins": {
      const admins = await botService.listAdmins();
      if (admins.length > 0) {
        message = "Administradores deste bot: ";
        message += admins.map(u => u.name).join(", ");
        message += ".";
      } else {
        message =
          "Nenhum usuário foi cadastrado como administrador do bot ainda.";
      }
      break;
    }

    case "add_admin": {
      if (!user) {
        throw new FrompsBotError("Usuário não encontrado!");
      }
      await botService.addAdmin(user);
      message = `${user.name} foi adicionado como administrador deste bot.`;
      break;
    }

    case "remove_admin": {
      if (!user) {
        throw new FrompsBotError("Usuário não encontrado!");
      }
      await botService.removeAdmin(user);
      message = `${user.name} foi removido do cargo de administrador deste bot.`;
      break;
    }

    case "list_monitors": {
      if (!game) {
        throw new FrompsBotError("Jogo não encontrado!");
      }

      const monitors = await botService.listMonitors(game);
      if (monitors.length > 0) {
        message = `Monitores de ${game.shortName}: `;
        message += monitors.map(u => u.name).join(", ");
        message += ".";
      } else {
        message =
          `Nenhum usuário foi cadastrado como monitor de ${game.shortName} ainda.`;
      }
      break;
    }

    case "add_monitor": {
      if (!game) {
        throw new FrompsBotError("Jogo não encontrado!");
      }

      if (!user) {
        throw new FrompsBotError("Usuário não encontrado!");
      }
      await botService.addMonitor(game, user);
      message = `${user.name} foi adicionado como monitor de ${game.shortName}.`;
      break;
    }

    case "remove_monitor": {
      if (!game) {
        throw new FrompsBotError("Jogo não encontrado!");
      }

      if (!user) {
        throw new FrompsBotError("Usuário não encontrado!");
      }

      await botService.removeMonitor(game, user);
      message = `${user.name} foi removido do cargo de monitor de ${game.shortName}.`;
      break;
    }

    }

    await interaction.reply({ content: message, ephemeral: true });
  }

  #gameField;
}