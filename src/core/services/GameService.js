"use strict";

const { check, transactional } = require("../../decorators");
const { hasPermissions } = require("../../constraints");
const { Permissions } = require("../constants");
const { FrompsBotError } = require("../../errors");
const { AppModule } = require("../../app");

const sequelize = require("sequelize");

module.exports = class GameService extends AppModule {
  async listGames(options) {
    const queryOptions = this.#processGameQueryOptions(options);
    const func = options?.count ? "findAndCountAll" : "findAll";

    return await this.app.models.game[func](queryOptions);
  }

  async getGameById(gameId, options) {
    const queryOptions = this.#processGameQueryOptions(options);
    return await this.app.models.game.findOne({
      ...queryOptions,
      where: { id: gameId }
    });
  }

  async getGameByCode(gameCode, options) {
    const queryOptions = this.#processGameQueryOptions(options);
    return await this.app.models.game.findOne({
      ...queryOptions,
      where: { code: gameCode.toUpperCase() }
    });
  }

  async listGameModes(options) {
    const queryOptions = this.#processGameModeQueryOptions(options);
    const func = options?.count ? "findAndCountAll" : "findAll";

    return await this.app.models.gameMode[func](queryOptions);
  }

  async getGameModeById(gameId, gameModeId, options = {}) {
    const queryOptions = this.#processGameModeQueryOptions(options);
    return await this.app.models.gameMode.findOne({
      ...queryOptions,
      where: { gameId, id: gameModeId }
    });
  }

  async getGameModeByName(gameId, gameModeName, options = {}) {
    const queryOptions = this.#processGameModeQueryOptions(options);
    return await this.app.models.gameMode.findOne({
      ...queryOptions,
      where: {
        [sequelize.Op.and]: [
          { gameId },
          sequelize.where(
            sequelize.fn("UPPER", sequelize.col("name")),
            gameModeName.toUpperCase()
          )
        ]
      }
    });
  }

  @transactional()
  @check(hasPermissions(Permissions.game.create))
  async createGame(code, name, shortName) {
    const game = await this.getGameByCode(code);
    if (game) {
      throw new FrompsBotError(
        `Já existe um jogo cadastrado com o código '${code.toUpperCase()}'.`);
    }
    return await this.app.models.game.create({ code, name, shortName });
  }

  @transactional()
  @check(hasPermissions(Permissions.game.remove))
  async removeGame(game) {
    await game.destroy();
    return game;
  }

  @transactional()
  @check(hasPermissions(Permissions.game.createMode))
  async createGameMode(game, gameModeName, gameModeDescription) {
    if (typeof gameModeDescription !== typeof "" || gameModeDescription.length <= 0) {
      throw new FrompsBotError("A descrição deve ter até 80 caracteres.");
    }

    let mode = await this.getGameModeByName(game.id, gameModeName);
    if (mode) {
      throw new FrompsBotError(
        `Já existe um modo com o nome ${gameModeName} para ${game.shortName}.`
      );
    }

    mode = await this.app.models.gameMode.create({
      gameId: game.id, name: gameModeName, description: gameModeDescription
    });

    return mode;
  }

  @transactional()
  @check(hasPermissions(Permissions.game.removeMode))
  async removeGameMode(gameMode) {
    await gameMode.destroy();
    return gameMode;
  }

  #processQueryOptions(options = {}) {
    const queryOptions = { where: {} };

    if (options?.ordered) {
      queryOptions.order = [["name", "ASC"]];
    }

    if (options?.pagination) {
      const { pageSize, pageNumber } = options.pagination;

      queryOptions.limit = pageSize;
      queryOptions.offset = (pageNumber - 1) * pageSize;
    }

    return queryOptions;
  }

  #processGameQueryOptions(options) {
    const queryOptions = this.#processQueryOptions(options);

    if (options?.includeModes) {
      queryOptions.include = ["modes"];
    }

    if (options?.filter) {
      const search = `%${options.filter}%`;
      queryOptions.where[sequelize.Op.or] = {
        name: {
          [sequelize.Op.iLike]: search
        },
        shortName: {
          [sequelize.Op.iLike]: search
        }
      };
    }

    return queryOptions;
  }

  #processGameModeQueryOptions(options) {
    const queryOptions = this.#processQueryOptions(options);

    if (options?.includeGame) {
      queryOptions.include = ["game"];
    }

    if (!(options?.includeAll)) {
      queryOptions.where["data.disabled"] = { [sequelize.Op.not]: true };
    }

    if (options?.gameId) {
      queryOptions.where["gameId"] = options.gameId;
    }

    if (options?.filter) {
      const search = `%${options.filter}%`;
      queryOptions.where["name"] = { [sequelize.Op.iLike]: search };
    }

    return queryOptions;
  }
};
