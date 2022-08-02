"use strict";

const AppModule = require("../../app/AppModule");
const Permissions = require("../constants/Permissions");
const hasPermissions = require("../../constraints/hasPermissions");
const check = require("../../decorators/check");
const transactional = require("../../decorators/transactional");
const FrompsBotError = require("../../errors/FrompsBotError");

const sequelize = require("sequelize");

module.exports = class BotService extends AppModule {
  async isAdmin(user) {
    const data = await this.#getBotData(user);
    return (data.isAdmin === true);
  }

  async isMonitor(user, game) {
    const data = await this.#getBotData(user);
    return (data.monitors?.includes(game.id) === true);
  }

  @check(hasPermissions(Permissions.bot.listAdmins))
  async listAdmins(options) {
    return await this.app.services.user.listUsersFilterByData(
      { bot: { isAdmin: true } },
      options
    );
  }

  @check(hasPermissions(Permissions.bot.listMonitors))
  async listMonitors(game, options) {
    return await this.app.services.user.listUsersFilterByData(
      { bot: { monitors: { [sequelize.Op.contains]: JSON.stringify(game.id) } } },
      options
    );
  }

  @transactional()
  @check(hasPermissions(Permissions.bot.addAdmin))
  async addAdmin(user) {
    const data = await this.#getBotData(user);
    if (data.isAdmin === true) {
      throw new FrompsBotError(
        `O usuário ${user.name} já é administrador deste bot!`);
    }
    data.isAdmin = true;
    await this.#setBotData(user, data);
  }

  @transactional()
  @check(hasPermissions(Permissions.bot.removeAdmin))
  async removeAdmin(user) {
    const data = await this.#getBotData(user);
    if (!data.isAdmin) {
      throw new FrompsBotError(
        `O usuário ${user.name} não é administrador deste bot!`);
    }
    delete data.isAdmin;
    await this.#setBotData(user, data);
  }

  @transactional()
  @check(hasPermissions(Permissions.bot.addMonitor))
  async addMonitor(user, game) {
    const data = await this.#getBotData(user);
    if (data.monitors?.includes(game.id)) {
      throw new FrompsBotError(
        `O usuário ${user.name} já é monitor de ${game.shortName}`);
    }
    if (!Array.isArray(data.monitors)) {
      data.monitors = [];
    }
    data.monitors.push(game.id);
    await this.#setBotData(user, data);
  }

  @transactional()
  @check(hasPermissions(Permissions.bot.removeMonitor))
  async removeMonitor(game, user) {
    const data = await this.#getBotData(user);
    if (!(data.monitors?.includes(game.id))) {
      throw new FrompsBotError(
        `O usuário ${user.name} não é monitor de ${game.shortName}`);
    }

    const index = data.monitors.findIndex(
      gameId => gameId === game.id
    );
    data.monitors.splice(index, 1);
    await this.#setBotData(user, data);
  }

  async #getBotData(modelInstance) {
    return await modelInstance.getData("bot", {});
  }

  async #setBotData(modelInstance, data) {
    return await modelInstance.setData("bot", data);
  }
};
