import { default as BotCommand } from "./BotCommand";
import { default as DatetimeCommand } from "./DatetimeCommand";
import { default as GameCommand } from "./GameCommand";
import { default as NicknameCommand } from "./NicknameCommand";

export type SlashCommandName = keyof typeof slashCommands;

export const slashCommands = {
  BotCommand,
  DatetimeCommand,
  GameCommand,
  NicknameCommand
};
