import check from "../../decorators/check";
import Permissions from "../constants/Permissions";
import FrompsBotError from "../../errors/FrompsBotError";
import AppModule from "../../app/AppModule";
import { GameModel } from "../models/gameModel";
import { Attributes, FindOptions } from "sequelize";
import { GameModeModel } from "../models/gameModeModel";

import sequelize = require("sequelize");
import transactional from "../../decorators/transactional";
import hasPermission from "../../constraints/hasPermission";
import Application from "../../app/Application";


declare module "../models/gameModeModel" {
  interface GameModeData {
    disabled?: boolean
  }
}


export interface IGameServiceOptions {
  ordered?: boolean;
  pagination?: { pageSize: number, pageNumber: number };
  limit?: number;
}

export interface IGameServiceGameOptions extends IGameServiceOptions {
  includeModes?: boolean;
  filter?: string;
}

export interface IGameServiceGameModeOptions extends IGameServiceOptions {
  includeGame?: boolean;
  includeAll?: boolean;
  filter?: string;
  gameId?: number;
}


export default class GameService extends AppModule {
  constructor(app: Application) {
    super(app);
  }

  async listGames(options?: IGameServiceGameOptions) {
    const queryOptions = this.#processGameQueryOptions(options);

    return await this.app.models.game.findAll(queryOptions);
  }

  async listAndCountGames(options?: IGameServiceGameOptions) {
    const queryOptions = this.#processGameQueryOptions(options);

    return await this.app.models.game.findAndCountAll(queryOptions);
  }

  async getGameById(gameId: number, options?: IGameServiceGameOptions) {
    const queryOptions = this.#processGameQueryOptions(options);
    return await this.app.models.game.findOne({
      ...queryOptions,
      where: { id: gameId }
    });
  }

  async getGameByCode(gameCode: string, options?: IGameServiceGameOptions) {
    const queryOptions = this.#processGameQueryOptions(options);
    return await this.app.models.game.findOne({
      ...queryOptions,
      where: { code: gameCode.toUpperCase() }
    });
  }

  async listGameModes(options?: IGameServiceGameModeOptions) {
    const queryOptions = this.#processGameModeQueryOptions(options);

    return await this.app.models.gameMode.findAll(queryOptions);
  }

  async listAndCountGameModes(options?: IGameServiceGameModeOptions) {
    const queryOptions = this.#processGameModeQueryOptions(options);

    return await this.app.models.gameMode.findAndCountAll(queryOptions);
  }

  async getGameModeById(gameId: number, gameModeId: number, options?: IGameServiceGameModeOptions) {
    const queryOptions = this.#processGameModeQueryOptions(options);
    return await this.app.models.gameMode.findOne({
      ...queryOptions,
      where: { gameId, id: gameModeId }
    });
  }

  async getGameModeByName(gameId: number, gameModeName: string, options?: IGameServiceGameModeOptions) {
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
  @check(hasPermission(Permissions.game.create))
  async createGame(code: string, name: string, shortName?: string) {
    const game = await this.getGameByCode(code);
    if (game) {
      throw new FrompsBotError(
        `Já existe um jogo cadastrado com o código '${code.toUpperCase()}'.`);
    }
    return await this.app.models.game.create({ code, name, shortName });
  }

  @transactional()
  @check(hasPermission(Permissions.game.remove))
  async removeGame(game: GameModel) {
    await game.destroy();
    return game;
  }

  @transactional()
  @check(hasPermission(Permissions.game.createMode))
  async createGameMode(game: GameModel, gameModeName: string, gameModeDescription: string) {
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
  @check(hasPermission(Permissions.game.removeMode))
  async removeGameMode(gameMode: GameModeModel) {
    await gameMode.destroy();
    return gameMode;
  }

  #processQueryOptions<T extends GameModel | GameModeModel>(options: IGameServiceOptions = {}) {
    const queryOptions: FindOptions<Attributes<T>> = {};

    if (options?.ordered) {
      queryOptions.order = [["name", "ASC"]];
    }

    if (options?.pagination) {
      const { pageSize, pageNumber } = options.pagination;

      queryOptions.limit = pageSize;
      queryOptions.offset = (pageNumber - 1) * pageSize;
    } else if (options.limit) {
      queryOptions.limit = options.limit;
    }

    return queryOptions;
  }

  #processGameQueryOptions(options?: IGameServiceGameOptions) {
    const queryOptions = this.#processQueryOptions<GameModel>(options);

    if (options?.includeModes) {
      queryOptions.include = ["modes"];
    }

    if (options?.filter) {
      const search = `%${options.filter}%`;

      queryOptions.where = {
        [sequelize.Op.or]: {
          name: {
            [sequelize.Op.iLike]: search
          },
          shortName: {
            [sequelize.Op.iLike]: search
          }
        }
      };
    }

    return queryOptions;
  }

  #processGameModeQueryOptions(options?: IGameServiceGameModeOptions) {
    const queryOptions = this.#processQueryOptions<GameModeModel>(options);

    if (options?.includeGame) {
      queryOptions.include = ["game"];
    }

    // TODO: create helper for combining query filters
    if (!(options?.includeAll)) {
      const old = queryOptions.where;

      if (old) {
        queryOptions.where = {
          [sequelize.Op.and]: [
            old, {
              "data.disabled": { [sequelize.Op.not]: true }
            }
          ]
        };
      } else {
        queryOptions.where = {
          "data.disabled": { [sequelize.Op.not]: true }
        };
      }
    }

    if (options?.gameId) {
      const old = queryOptions.where;

      if (old) {
        queryOptions.where = {
          [sequelize.Op.and]: [
            old, {
              "gameId": options.gameId
            }
          ]
        };
      } else {
        queryOptions.where = {
          "gameId": options.gameId
        };
      }
    }

    if (options?.filter) {
      const search = `%${options.filter}%`;

      const old = queryOptions.where;
      if (old) {
        queryOptions.where = {
          [sequelize.Op.and]: [
            old, {
              "name": { [sequelize.Op.iLike]: search }
            }
          ]
        };
      } else {
        queryOptions.where = {
          "name": { [sequelize.Op.iLike]: search }
        };
      }
    }

    return queryOptions;
  }
}
