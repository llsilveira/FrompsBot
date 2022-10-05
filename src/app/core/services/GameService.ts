import check from "../../../decorators/check";
import Permissions from "../../../constants/Permissions";
import { GameModel, GAME_MAX_CODE_LENGTH, GAME_MAX_NAME_LENGTH, GAME_MAX_SHORTNAME_LENGTH } from "../models/gameModel";
import { GameModeModel, GAMEMODE_MAX_DESCRIPTION_LENGTH, GAMEMODE_MAX_LONGDESCRIPTION_LENGTH, GAMEMODE_MAX_NAME_LENGTH } from "../models/gameModeModel";

import transactional from "../../../decorators/transactional";
import hasPermission from "../../../constraints/hasPermission";
import AppService, { IService } from "../AppService";
import { RepositoryFindOptions } from "../AppRepository";
import Result, { ResultT, Success } from "../logic/Result";
import { GameRepository } from "../repositories/GameRepository";
import { GameModeRepository } from "../repositories/GameModeRepository";
import { ResultError } from "../logic/error/ResultError";
import { ApplicationError } from "../logic/error/ApplicationError";


declare module "../models/gameModeModel" {
  interface GameModeData {
    disabled?: boolean
  }
}


class GameCodeAlreadyInUseError extends ResultError {
  constructor(code: string) {
    super(`Já existe um jogo cadastrado com o código '${code.toUpperCase()}'.`);
  }
}

class GameNameAlreadyInUseError extends ResultError {
  constructor(name: string) {
    super(`Já existe um jogo cadastrado com o nome '${name.toUpperCase()}'.`);
  }
}

class GameCodeLengthError extends ResultError {
  constructor() {
    super(`O código do jogo deve conter até ${GAME_MAX_CODE_LENGTH} caracteres`);
  }
}

class GameNameLengthError extends ResultError {
  constructor() {
    super(`O nome do jogo deve conter até ${GAME_MAX_NAME_LENGTH} caracteres`);
  }
}

class GameShortNameLengthError extends ResultError {
  constructor() {
    super(`O nome curto do jogo deve conter até ${GAME_MAX_SHORTNAME_LENGTH} caracteres`);
  }
}

class GameNotFoundError extends ResultError {
  constructor() {
    super("O Jogo informado não existe!");
  }
}

class GameModeNameLengthError extends ResultError {
  constructor() {
    super(`O nome do modo de jogo deve conter até ${GAMEMODE_MAX_NAME_LENGTH} caracteres.`);
  }
}

class GameModeDescriptionLengthError extends ResultError {
  constructor() {
    super(
      `A descrição do modo de jogo deve conter até ${GAMEMODE_MAX_DESCRIPTION_LENGTH} caracteres.`
    );
  }
}

class GameModeLongDescriptionLengthError extends ResultError {
  constructor() {
    super(
      "A descrição longa do modo de jogo deve conter até " +
      `${GAMEMODE_MAX_LONGDESCRIPTION_LENGTH} caracteres.`
    );
  }
}

class GameModeNameAlreadyInUseError extends ResultError {
  constructor() {
    super("Já existe um modo com o mesmo nome para este jogo.");
  }
}


export default class GameService
  extends AppService
  implements IService<GameService> {

  async listGames(options?: RepositoryFindOptions<GameModel>) {
    return Result.success(await this.app.repos.game.findMany(options));
  }

  async listAndCountGames(options?: RepositoryFindOptions<GameModel>) {
    return Result.success(await this.app.repos.game.findAndCountMany(options));
  }

  async getGameFromId(gameId: number, options?: RepositoryFindOptions<GameModel>) {
    return Result.success(await this.app.repos.game.findById(gameId, options));
  }

  async getGameFromCode(gameCode: string, options: RepositoryFindOptions<GameModel> = {}) {
    options.filter = GameRepository.codeFilter(gameCode);
    return Result.success(await this.app.repos.game.findOne(options));
  }

  async getGameFromIdOrCode(
    gameIdOrCode: number | string,
    options?: RepositoryFindOptions<GameModel>
  ) {
    if (typeof gameIdOrCode === "number") {
      return this.getGameFromId(gameIdOrCode, options);
    }
    return this.getGameFromCode(gameIdOrCode, options);
  }

  async findGameByName(nameFilter: string, options: RepositoryFindOptions<GameModel> = {}) {
    options.filter = GameRepository.strAttrFilter<GameModel>("name", nameFilter);
    return Result.success(await this.app.repos.game.findMany(options));
  }

  async findGameByCode(codeFilter: string, options: RepositoryFindOptions<GameModel> = {}) {
    options.filter = GameRepository.strAttrFilter<GameModel>("code", codeFilter);
    return Result.success(await this.app.repos.game.findMany(options));
  }

  async findGameByNameOrCode(strFilter: string, options: RepositoryFindOptions<GameModel> = {}) {
    options.filter = GameRepository.combineFilters([
      GameRepository.strAttrFilter<GameModel>("name", strFilter),
      GameRepository.strAttrFilter<GameModel>("code", strFilter)
    ], { useOr: true });
    return Result.success(await this.app.repos.game.findMany(options));
  }

  validateGameFields(code: string, name: string, shortName?: string) {
    if (code.length > GAME_MAX_CODE_LENGTH) {
      return Result.fail(new GameCodeLengthError());
    }

    if (name.length > GAME_MAX_NAME_LENGTH) {
      return Result.fail(new GameNameLengthError());
    }

    if (shortName && shortName.length > GAME_MAX_SHORTNAME_LENGTH) {
      return Result.fail(new GameShortNameLengthError());
    }

    return Result.success();
  }

  async validateGameUniqueFields(code: string, name: string, ignoredId?: number) {
    const game = await this.app.repos.game.findOne({
      filter: GameRepository.combineFilters<GameModel>([
        { code: code.toUpperCase() }, { name }
      ], { useOr: true })
    });

    if (game && (!ignoredId || game.id !== ignoredId)) {
      if (game.code === code.toUpperCase()) {
        return Result.fail(new GameCodeAlreadyInUseError(code));
      } else if (game.name === name) {
        return Result.fail(new GameNameAlreadyInUseError(name));
      } else {
        throw new ApplicationError(
          "Search for repeated fields while validating game returned non-null value but " +
          "fields didn't match"
        );
      }
    }

    return Result.success();
  }

  @transactional()
  @check(hasPermission(Permissions.game.create))
  async createGame(code: string, name: string, shortName?: string) {

    const validationResult = this.validateGameFields(code, name, shortName);
    if (!validationResult.success) { return validationResult; }

    const uniqueValidationResult = await this.validateGameUniqueFields(code, name);
    if (!uniqueValidationResult.success) { return uniqueValidationResult; }

    return Result.success(
      await this.app.repos.game.create({ code, name, shortName }));
  }

  @transactional()
  @check(hasPermission(Permissions.game.update))
  async updateGame(game: GameModel, code: string, name: string, shortName?: string) {

    const validationResult = this.validateGameFields(code, name, shortName);
    if (!validationResult.success) { return validationResult; }

    const uniqueValidationResult = await this.validateGameUniqueFields(code, name, game.id);
    if (!uniqueValidationResult.success) { return uniqueValidationResult; }

    game.code = code;
    game.name = name;
    game.shortName = shortName as string;
    await this.app.repos.game.save(game);

    return Result.success();
  }

  @transactional()
  @check(hasPermission(Permissions.game.remove))
  async removeGame(game: GameModel) {
    await this.app.repos.game.delete(game);

    return Result.success();
  }


  async listGameModes(options?: RepositoryFindOptions<GameModeModel>) {
    return Result.success(await this.app.repos.gameMode.findMany(options));
  }

  async listAndCountGameModes(options?: RepositoryFindOptions<GameModeModel>) {
    return Result.success(await this.app.repos.gameMode.findAndCountMany(options));
  }


  async getGameModeById(gameModeId: number, options?: RepositoryFindOptions<GameModeModel>) {
    return Result.success(await this.app.repos.gameMode.findById(gameModeId, options));
  }

  async getGameModeByName(
    game: GameModel,
    gameModeName: string,
    options?: RepositoryFindOptions<GameModeModel>
  ): Promise<Success<GameModeModel | null>>
  async getGameModeByName(
    gameIdOrCode: number | string,
    gameModeName: string,
    options?: RepositoryFindOptions<GameModeModel>
  ): Promise<ResultT<GameModeModel | null, GameNotFoundError>>
  async getGameModeByName(
    gameSelector: GameModel | number | string,
    gameModeName: string,
    options: RepositoryFindOptions<GameModeModel> = {}
  ): Promise<ResultT<GameModeModel | null, GameNotFoundError>> {

    let game: GameModel | null = null;
    if (typeof gameSelector === "number" || typeof gameSelector === "string") {
      game = (await this.getGameFromIdOrCode(gameSelector)).value;
    } else {
      game = gameSelector;
    }

    if (!game) {
      return Result.fail(new GameNotFoundError());
    }

    options.filter = GameModeRepository.combineFilters<GameModeModel>([
      { gameId: game.id },
      GameModeRepository.nameIgnoreCaseFilter(gameModeName)
    ]);
    const mode = await this.app.repos.gameMode.findOne(options);

    return Result.success(mode);
  }

  async findGameModeByName(
    game: GameModel,
    gameModeName: string,
    options?: RepositoryFindOptions<GameModeModel>
  ): Promise<Success<GameModeModel[]>>
  async findGameModeByName(
    gameIdOrCode: number | string,
    gameModeName: string,
    options?: RepositoryFindOptions<GameModeModel>
    ): Promise<ResultT<GameModeModel[], GameNotFoundError>>
  async findGameModeByName(
    gameSelector: GameModel | number | string,
    gameModeName: string,
    options: RepositoryFindOptions<GameModeModel> = {}
  ): Promise<ResultT<GameModeModel[], GameNotFoundError>> {

    let game: GameModel | null = null;
    if (typeof gameSelector === "number" || typeof gameSelector === "string") {
      game = (await this.getGameFromIdOrCode(gameSelector)).value;
    } else {
      game = gameSelector;
    }

    if (!game) {
      return Result.fail(new GameNotFoundError());
    }

    options.filter = GameModeRepository.combineFilters<GameModeModel>([
      { gameId: game.id },
      GameModeRepository.searchNameFilter(gameModeName)
    ]);
    const modes = await this.app.repos.gameMode.findMany(options);

    return Result.success(modes);
  }

  validateGameModeFields(
    gameModeName: string,
    gameModeDescription: string,
    gameModeLongDescription: string
  ) {
    if (gameModeName.length > GAMEMODE_MAX_NAME_LENGTH) {
      return Result.fail(new GameModeNameLengthError());
    }

    if (gameModeDescription.length > GAMEMODE_MAX_DESCRIPTION_LENGTH) {
      return Result.fail(new GameModeDescriptionLengthError());
    }

    if (gameModeLongDescription.length > GAMEMODE_MAX_LONGDESCRIPTION_LENGTH) {
      return Result.fail(new GameModeLongDescriptionLengthError());
    }

    return Result.success();
  }

  async validateGameModeUniqueFields(gameId: number, name: string, ignoredGameModeId?: number) {

    const otherModeResult = (await this.getGameModeByName(gameId, name));
    if (!otherModeResult.success) { return otherModeResult; }

    const otherMode = otherModeResult.value;
    if (otherMode && (!ignoredGameModeId || ignoredGameModeId !== otherMode.id)) {
      if (otherMode.name.toUpperCase() === name.toUpperCase()) {
        return Result.fail(new GameModeNameAlreadyInUseError());
      } else {
        throw new ApplicationError(
          "Search for repeated fields while validating game mode returned non-null value but " +
          "fields didn't match"
        );
      }
    }

    return Result.success();
  }

  @transactional()
  @check(hasPermission(Permissions.game.createMode))
  async createGameMode(
    game: GameModel,
    gameModeName: string,
    gameModeDescription: string,
    gameModeLongDescription: string
  ) {

    const validationResult = this.validateGameModeFields(
      gameModeName, gameModeDescription, gameModeLongDescription);
    if (!validationResult.success) { return validationResult; }

    const uniqueValidationResult = await this.validateGameModeUniqueFields(
      game.id, gameModeName);
    if (!uniqueValidationResult.success) { return uniqueValidationResult; }

    const mode = await this.app.repos.gameMode.create({
      gameId: game.id,
      name: gameModeName,
      description: gameModeDescription,
      longDescription: gameModeLongDescription
    });

    return Result.success(mode);
  }

  @transactional()
  @check(hasPermission(Permissions.game.update))
  async updateGameMode(
    gameMode: GameModeModel,
    name: string,
    description: string,
    longDescription: string
  ) {

    const validationResult = this.validateGameModeFields(
      name, description, longDescription);
    if (!validationResult.success) { return validationResult; }

    const uniqueValidationResult = await this.validateGameModeUniqueFields(
      gameMode.gameId, name, gameMode.id);
    if (!uniqueValidationResult.success) { return uniqueValidationResult; }

    gameMode.name = name;
    gameMode.description = description;
    gameMode.longDescription = longDescription;
    await gameMode.save();

    return Result.success();
  }

  @transactional()
  @check(hasPermission(Permissions.game.removeMode))
  async removeGameMode(gameMode: GameModeModel) {
    await this.app.repos.gameMode.delete(gameMode);

    return Result.success();
  }
}
