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

  async getFromCode(code, { includeModes = false } = {}) {
    const findParams = {};
    if (includeModes) { findParams.include = "modes"; }
    return await this.Game.findByPk(code, findParams);
  }

  async getGameMode(gameCode, name, { includeGame = false } = {}) {
    const findParams = {};
    if (includeGame) { findParams.include = "game"; }
    return await this.GameMode.findByPk({ gameCode, name }, findParams);
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
  async create(code, name, shortname) {
    return await this.Game.create({ code, name, shortname });
  }

  @check(hasPermissions(Permissions.GAME.createMode))
  @transactional()
  async createMode(gameCode, name, description) {
    let mode = await this.getGameMode(gameCode, name);
    if (mode) {
      // TODO: throw error
    }

    const game = await this.getFromCode(gameCode);
    if (!game) {
      // TODO: throw error
    }

    mode = await this.GameMode.create({
      gameCode, name, data: { description } });

    return { game, mode };
  }
};
