import { SlashCommandBuilder } from "@discordjs/builders";
import { InteractionType } from "discord.js";
import InteractionHandler, { InteractionHandlerOptions } from "./InteractionHandler";

export default abstract class ApplicationCommand
  extends InteractionHandler<InteractionType.ApplicationCommand> {

  constructor(
    commandName: string,
    commandDescription: string,
    options?: InteractionHandlerOptions
  ) {
    super(InteractionType.ApplicationCommand, options);

    this.commandName = commandName;

    this.builder = new SlashCommandBuilder()
      .setName(this.commandName)
      .setDescription(commandDescription);
  }

  // abstract handleInteraction from InteractionHandler

  readonly commandName: string;
  readonly builder: SlashCommandBuilder;
}
