import { ChatInputCommandInteraction, ModalSubmitInteraction } from "discord.js";
import Application from "../../../app/Application";
import ApplicationCommand from "../interaction/ApplicationCommand";
import RegisterModal from "../modals/RegisterModal";
import Discord, { DiscordUserError } from "../../Discord";
import AccountProvider from "../../../constants/AccountProvider";
import { ApplicationError } from "../../../app/core/logic/error/ApplicationError";


class InteractionError extends ApplicationError {}


export default class RegisterCommand extends ApplicationCommand {
  constructor(discord: Discord) {
    super(
      "register",
      "Cria um perfil no bot vinculado à sua conta do Discord.",
      { annonymous: true }
    );

    this.registerModal = new RegisterModal(
      "registerModal", this.handleModalSubmit.bind(this), { annonymous: true }
    );

    discord.registerInteractionHandler(this.registerModal);
  }

  async handleInteraction(
    interaction: ChatInputCommandInteraction,
    app: Application
  ) {
    const discordId = interaction.user.id;

    const user = (await app.services.user.getUserFromProvider(
      AccountProvider.DISCORD, discordId
    )).value;

    if (user) {
      throw new DiscordUserError("Você já está registrado!");
    }

    const modal = this.registerModal.createModal(discordId);
    await interaction.showModal(modal);
  }

  async handleModalSubmit(
    interaction: ModalSubmitInteraction,
    app: Application,
    discordId: string,
    nickname: string
  ) {
    if (discordId !== interaction.user.id) {
      throw new InteractionError("Discord user IDs don't match.");
    }

    await app.services.user.register(
      AccountProvider.DISCORD, discordId, nickname);

    await interaction.reply({
      content: "Registro realizado com sucesso!",
      ephemeral: true
    });
  }

  private registerModal: RegisterModal;
}
