"use strict";

const { check, transactional } = require("@frompsbot/common/decorators");
const { hasPermissions } = require("@frompsbot/common/constraints");
const { Permissions, Roles } = require("@frompsbot/common/constants");

const BaseModule = require("@frompsbot/modules/BaseModule");

module.exports = class GameController extends BaseModule {
  constructor({ app }) {
    super({ app });
    this.Game = this.app.db.getModel("Game");
    this.GameMode = this.app.db.getModel("GameMode");
  }

  async isMonitor(gameCode, user) {
    const monitor = (await this.user.getRoles(user))[Roles.MONITOR];
    if (typeof monitor === "object") {
      return monitor["games"].includes(gameCode);
    }
    return false;
  }

  @check(hasPermissions(Permissions.GAME.create))
  @transactional()
  async create(code, name, shortName) {
    return await this.Game.create({ code, name, shortName });
  }

  @check(hasPermissions(Permissions.GAME.createMode))
  @transactional()
  async createMode(gameCode, name, description) {
    return await this.GameMode.create({
      gameCode, name, data: { description } });
  }
};
