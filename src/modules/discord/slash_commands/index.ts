import { default as BotCommand } from "./BotCommand";
import { default as DatetimeCommand } from "./DatetimeCommand";
import { default as GameCommand } from "./GameCommand";
import { default as GameModeCommand } from "./GameModeCommand";
import { default as NicknameCommand } from "./NicknameCommand";
import { default as RegisterCommand } from "./RegisterCommand";

export type SlashCommandName = keyof typeof slashCommands;

export const slashCommands = {
  BotCommand,
  DatetimeCommand,
  GameCommand,
  GameModeCommand,
  NicknameCommand,
  RegisterCommand
};
