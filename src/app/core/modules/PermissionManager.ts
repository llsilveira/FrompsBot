import AppModule from "../../AppModule";
import Permissions, { Permission } from "../../../constants/Permissions";

import { GameModel } from "../models/gameModel";
import { UserModel } from "../models/userModel";
import { GameModeModel } from "../models/gameModeModel";


export type IPermissionManager = {
  [P in Permission]: (...args: Parameters<PermissionManager[P]>) => boolean | Promise<boolean>;
};

export default class PermissionManager
  extends AppModule
  implements IPermissionManager {

  [Permissions.bot.listAdmins]() {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isAdmin(user);
  }

  [Permissions.bot.addAdmin]() {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isAdmin(user);
  }

  [Permissions.bot.removeAdmin]() {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isAdmin(user);
  }

  [Permissions.bot.listMonitors](game: GameModel) {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && (
      this.app.services.bot.isAdmin(user) ||
      this.app.services.bot.isMonitor(user, game)
    );
  }

  [Permissions.bot.addMonitor]() {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isAdmin(user);
  }

  [Permissions.bot.removeMonitor]() {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isAdmin(user);
  }

  [Permissions.user.changeName](subject: UserModel) {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && (
      (this.app.services.bot.isAdmin(user)) ||
      user.id === subject.id
    );
  }

  [Permissions.game.create]() {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isAdmin(user);
  }

  [Permissions.game.update]() {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isAdmin(user);
  }

  [Permissions.game.remove]() {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isAdmin(user);
  }

  [Permissions.game.createMode](game: GameModel) {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isMonitor(user, game);
  }

  async [Permissions.game.removeMode](gameMode: GameModeModel) {
    const game = gameMode.game || await this.app.services.game.getGameById(gameMode.gameId);

    if (!game) {
      // Should be impossible
      throw new Error(`GameMode with id '${gameMode.id}' does not have  game associated with it`);
    }

    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isMonitor(user, game);
  }

  [Permissions.race.create](game: GameModel) {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isMonitor(user, game);
  }

  [Permissions.race.update](game: GameModel) {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isMonitor(user, game);
  }

  [Permissions.race.remove](game: GameModel) {
    const user = this.app.services.auth.getLoggedUser().value;
    return !!user && this.app.services.bot.isMonitor(user, game);
  }
}
