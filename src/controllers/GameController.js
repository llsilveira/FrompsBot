"use strict";

const { check, transactional } = require("../decorators");
const { hasPermissions } = require("../constraints");
const { Permissions } = require("../constants");
const FrompsBotError = require("../errors/FrompsBotError");

module.exports = class GameController {
  constructor(app, gameModel, gameModeModel) {
    this.#gameModel = gameModel;
    this.#gameModeModel = gameModeModel;

    this.#app = app;
  }

  get app() {
    return this.#app;
  }

  async list() {
    return await this.#gameModel.findAll();
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

  isMonitor(game, user) {
    const userGameData = user.getData("game", {});
    return (userGameData.monitors?.includes(game.code) === true);
  }

  @check(hasPermissions(Permissions.game.addMonitor))
  @transactional()
  async addMonitor(game, user) {
    if (this.isMonitor(game, user)) {
      throw new FrompsBotError(
        `O usuário ${user.name} já é monitor de ${game.shortName}`);
    }

    const userGameData = user.getData("game", {});
    if (typeof userGameData.monitors !== "object") {
      userGameData.monitors = [];
    }
    userGameData.monitors.push(game.code);
    user.setData("game", userGameData);
    await user.save();
  }

  @check(hasPermissions(Permissions.game.removeMonitor))
  @transactional()
  async removeMonitor(game, user) {
    if (!this.isMonitor(game, user)) {
      throw new FrompsBotError(
        `O usuário ${user.name} não é monitor de ${game.shortName}`);
    }

    const userGameData = user.getData("game", {});
    const index = userGameData.monitors.findIndex(
      gameCode => gameCode === game.code
    );
    userGameData.monitors.splice(index, 1);
    user.setData("game", userGameData);
    await user.save();
  }

  @check(hasPermissions(Permissions.game.create))
  @transactional()
  async create(code, name, shortName) {
    const game = await this.getFromCode(code.toUpperCase());
    if (game) {
      throw new FrompsBotError(
        `Já existe um jogo cadastrado com o código '${code}'.`);
    }
    return await this.#gameModel.create({ code, name, shortName });
  }

  @check(hasPermissions(Permissions.game.remove))
  @transactional()
  async remove(code) {
    const game = await this.getFromCode(code.toUpperCase());
    if (!game) {
      throw new FrompsBotError("Jogo não encontrado!");
    }

    await game.destroy();
    return game;
  }

  @check(hasPermissions(Permissions.game.createMode))
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
  #app;
};
