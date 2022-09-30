import AppModule from "../../AppModule";
import Permissions from "../../../constants/Permissions";
import hasPermission from "../../../constraints/hasPermission";
import check from "../../../decorators/check";
import transactional from "../../../decorators/transactional";
import FrompsBotError from "../../../errors/FrompsBotError";
import { UserModel } from "../models/userModel";
import { GameModel } from "../models/gameModel";
import { Op } from "sequelize";
import Application from "../../Application";
import UserRepository from "../repositories/UserRepository";


type BotUserData = {
  isAdmin?: boolean,
  monitors?: number[]
}

declare module "../models/userModel" {
  interface UserData {
    bot?: BotUserData
  }
}

export default class BotService extends AppModule {
  constructor(app: Application) {
    super(app);
  }

  isAdmin(user: UserModel) {
    const data = this.#getBotUserData(user);
    return (data?.isAdmin === true);
  }

  isMonitor(user: UserModel, game: GameModel) {
    const data = this.#getBotUserData(user);
    return (data?.monitors?.includes(game.id) === true);
  }

  @check(hasPermission(Permissions.bot.listAdmins))
  async listAdmins() {
    return (await this.app.services.user.list({
      filter: UserRepository.dataFilter({ "bot": { "isAdmin": true } })
    })).value;
  }

  @check(hasPermission(Permissions.bot.listMonitors))
  async listMonitors(game: GameModel) {
    return (await this.app.services.user.list({
      filter: UserRepository.dataFilter(
        { "bot": { "monitors": { [Op.contains]: JSON.stringify(game.id) } } }
      )
    })).value;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @transactional()
  @check(hasPermission(Permissions.bot.addAdmin))
  async addAdmin(user: UserModel) {
    const data = this.#getBotUserData(user);
    if (data?.isAdmin === true) {
      throw new FrompsBotError(
        `O usuário ${user.name} já é administrador deste bot!`);
    }
    this.#setBotUserData(user, Object.assign({}, data, { isAdmin: true }));
    await user.save();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @transactional()
  @check(hasPermission(Permissions.bot.removeAdmin))
  async removeAdmin(user: UserModel) {
    const data = this.#getBotUserData(user);
    if (!data?.isAdmin) {
      throw new FrompsBotError(
        `O usuário ${user.name} não é administrador deste bot!`);
    }
    delete data.isAdmin;
    this.#setBotUserData(user, data);
    await user.save();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @transactional()
  @check(hasPermission(Permissions.bot.addMonitor))
  async addMonitor(game: GameModel, user: UserModel) {
    const data = this.#getBotUserData(user);
    if (data?.monitors?.includes(game.id)) {
      throw new FrompsBotError(
        `O usuário ${user.name} já é monitor de ${game.shortName}`);
    }

    const newData = Object.assign({}, data);
    if (!Array.isArray(newData.monitors)) {
      newData.monitors = [];
    }
    newData.monitors.push(game.id);
    this.#setBotUserData(user, newData);
    await user.save();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @transactional()
  @check(hasPermission(Permissions.bot.removeMonitor))
  async removeMonitor(game: GameModel, user: UserModel) {
    const data = this.#getBotUserData(user);
    if (!(data?.monitors?.includes(game.id))) {
      throw new FrompsBotError(
        `O usuário ${user.name} não é monitor de ${game.shortName}`);
    }

    const index = data.monitors.findIndex(
      gameId => gameId === game.id
    );
    data.monitors.splice(index, 1);
    this.#setBotUserData(user, data);
    await user.save();
  }

  #getBotUserData(modelInstance: UserModel): BotUserData | undefined {
    return modelInstance.getData("bot");
  }

  #setBotUserData(modelInstance: UserModel, data?: BotUserData) {
    return modelInstance.setData("bot", data);
  }
}
