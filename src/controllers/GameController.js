"use strict";

const { check, transactional } = require("../decorators");
const { hasPermissions } = require("../constraints");
const { Permissions, Roles } = require("../constants");

module.exports = class GameController {
  constructor(app, gameModel, gameModeModel, userController) {
    this.#gameModel = gameModel;
    this.#gameModeModel = gameModeModel;

    this.#userController = userController;

    this.#app = app;
  }

  get app() {
    return this.#app;
  }

  async getFromCode(code, { includeModes = false } = {}) {
    const findParams = {};
    if (includeModes) { findParams.include = "modes"; }
    return await this.#gameModel.findByPk(code, findParams);
  }

  async getGameMode(gameCode, name, { includeGame = false } = {}) {
    const findParams = {};
    if (includeGame) { findParams.include = "game"; }
    return await this.#gameModeModel.findByPk({ gameCode, name }, findParams);
  }

  async isMonitor(gameCode, user) {
    const monitor = (await this.#userController.getRoles(user))[Roles.MONITOR];
    if (typeof monitor === "object") {
      return monitor["games"].includes(gameCode);
    }
    return false;
  }

  @check(hasPermissions(Permissions.GAME.create))
  @transactional()
  async create(code, name, shortname) {
    return await this.#gameModel.create({ code, name, shortname });
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

    mode = await this.#gameModeModel.create({
      gameCode, name, data: { description } });

    return { game, mode };
  }

  #gameModel;
  #gameModeModel;
  #userController;
  #app;
};
