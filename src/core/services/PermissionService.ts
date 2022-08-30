import AppModule from "../../app/AppModule";
import Permissions, { Permission } from "../constants/Permissions";

import type Application from "../../app/Application";
import type AuthService from "./AuthService";
import type BotService from "./BotService";
import type GameService from "./GameService";
import { GameModel } from "../models/gameModel";
import { UserModel } from "../models/userModel";
import { GameModeModel } from "../models/gameModeModel";


export type IPermissionService = {
  [P in Permission]: (...args: Parameters<PermissionService[P]>) => boolean | Promise<boolean>;
};

export default class PermissionService extends AppModule implements IPermissionService {
  constructor(
    app: Application,
    authService: AuthService,
    botService: BotService,
    gameService: GameService
  ) {
    super(app);
    this.#services = Object.freeze({
      auth: authService,
      bot: botService,
      game: gameService
    });
  }

  [Permissions.bot.listAdmins]() {
    const user = this.#services.auth.getLoggedUser();
    return this.#services.bot.isAdmin(user);
  }

  [Permissions.bot.addAdmin]() {
    const user = this.#services.auth.getLoggedUser();
    return this.#services.bot.isAdmin(user);
  }

  [Permissions.bot.removeAdmin]() {
    const user = this.#services.auth.getLoggedUser();
    return this.#services.bot.isAdmin(user);
  }

  [Permissions.bot.listMonitors](game: GameModel) {
    const user = this.#services.auth.getLoggedUser();
    return (
      this.#services.bot.isAdmin(user) ||
      this.#services.bot.isMonitor(user, game)
    );
  }

  [Permissions.bot.addMonitor]() {
    const user = this.#services.auth.getLoggedUser();
    return this.#services.bot.isAdmin(user);
  }

  [Permissions.bot.removeMonitor]() {
    const user = this.#services.auth.getLoggedUser();
    return this.#services.bot.isAdmin(user);
  }

  [Permissions.user.changeName](subject: UserModel) {
    const user = this.#services.auth.getLoggedUser();
    return (
      (this.#services.bot.isAdmin(user)) ||
      user.id === subject.id
    );
  }

  [Permissions.game.create]() {
    const user = this.#services.auth.getLoggedUser();
    return this.#services.bot.isAdmin(user);
  }

  [Permissions.game.update]() {
    const user = this.#services.auth.getLoggedUser();
    return this.#services.bot.isAdmin(user);
  }

  [Permissions.game.remove]() {
    const user = this.#services.auth.getLoggedUser();
    return this.#services.bot.isAdmin(user);
  }

  [Permissions.game.createMode](game: GameModel) {
    return (this.#services.bot.isMonitor(
      this.#services.auth.getLoggedUser(), game
    ));
  }

  async [Permissions.game.removeMode](gameMode: GameModeModel) {
    const game = gameMode.game || await this.#services.game.getGameById(gameMode.gameId);

    if (!game) {
      // Should be impossible
      throw new Error(`GameMode with id '${gameMode.id}' does not have  game associated with it`);
    }

    return this.#services.bot.isMonitor(
      this.#services.auth.getLoggedUser(), game
    );
  }

  #services;
}
