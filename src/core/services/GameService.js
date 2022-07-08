"use strict";

const { check, transactional } = require("../../decorators");
const { hasPermissions } = require("../../constraints");
const { Permissions } = require("../constants");
const FrompsBotError = require("../../errors/FrompsBotError");
const AppModule = require("../../app/AppModule");

module.exports = class GameService extends AppModule {
  async list() {
    return await this.app.models.game.findAll();
  }

  async getFromCode(code, { includeModes = false } = {}) {
    const findParams = {};
    if (includeModes) { findParams.include = "modes"; }
    return await this.app.models.game.findByPk(code.toUpperCase(), findParams);
  }

  async listModes(gameCode, { includeAll = false } = {}) {
    const findParams = {
      where: { gameCode: gameCode.toUpperCase() }
    };
    if (!includeAll) {
      findParams.where.data = {
        disabled: false
      };
    }
    return await this.app.models.gameMode.findAll(findParams);
  }

  async getGameMode(gameCode, name, { includeGame = false } = {}) {
    const findParams = { where: { gameCode: gameCode.toUpperCase(), name } };
    if (includeGame) { findParams.include = "game"; }
    return await this.app.models.gameMode.findOne(findParams);
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
    return await this.app.models.game.create(
      { code: code.toUpperCase(), name, shortName }
    );
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
  async createMode(game, name, description) {
    if (typeof description !== typeof "" || description.length <= 0) {
      throw new FrompsBotError("A descrição deve ter até 80 caracteres.");
    }

    let mode = await this.getGameMode(game.code, name);
    if (mode) {
      throw new FrompsBotError(
        `Já existe um modo com o nome ${name} para ${game.shortName}.`
      );
    }

    mode = await this.app.models.gameMode.create({
      gameCode: game.code, name, description
    });

    return mode;
  }


  @check(hasPermissions(Permissions.game.removeMode))
  @transactional()
  async removeMode(game, name) {
    const mode = await this.getGameMode(game.code, name);
    if (!mode) {
      throw new FrompsBotError(
        `Não existe um modo com o nome ${name} para ${game.shortName}.`
      );
    }

    await mode.destroy();
  }
};
