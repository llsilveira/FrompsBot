import Permissions from "../../../constants/Permissions";
import check from "../../../decorators/check";
import transactional from "../../../decorators/transactional";
import hasPermission from "../../../constraints/hasPermission";
import { RaceModel } from "../models/raceModel";
import { GameModel } from "../models/gameModel";
import RaceStatus from "../../../constants/RaceStatus";
import AppService, { IService } from "../AppService";
import { RepositoryFindOptions } from "../AppRepository";
import Result, { ResultT } from "../logic/Result";
import { ResultError } from "../logic/error/ResultError";
import { GameModeModel } from "../models/gameModeModel";


export type RandomizerRaceData = {
  seedUrl: string,
  seedHash: string
}

declare module "../models/raceModel" {
  interface RaceData {
    randomizer?: RandomizerRaceData
  }
}

export interface RaceCreateParams {
  game: GameModel;
  gameMode: GameModeModel;
  seedUrl: string;
  seedHash: string;
  registrationDeadline?: Date
}


export default class RaceService
  extends AppService
  implements IService<RaceService> {

  async listRaces(options?: RepositoryFindOptions<RaceModel>) {
    return Result.success(await this.app.repos.race.findMany(options));
  }

  async listAndCountRaces(options?: RepositoryFindOptions<RaceModel>) {
    return Result.success(await this.app.models.race.findAndCountAll(options));
  }

  async getRaceFromId(raceId: number, options?: RepositoryFindOptions<RaceModel>) {
    return Result.success(await this.app.repos.race.findById(raceId, options));
  }

  async listRacesByGame(
    gameId: number, options?: RepositoryFindOptions<RaceModel>
  ): Promise<ResultT<RaceModel[], ResultError>>
  async listRacesByGame(
    gameCode: string, options?: RepositoryFindOptions<RaceModel>
  ): Promise<ResultT<RaceModel[], ResultError>>
  async listRacesByGame(
    game: GameModel, options?: RepositoryFindOptions<RaceModel>
  ): Promise<ResultT<RaceModel[]>>
  async listRacesByGame(
    gameOption: number | string | GameModel, options: RepositoryFindOptions<RaceModel> = {}
  ): Promise<ResultT<RaceModel[], ResultError>> {
    let game: GameModel;

    if (typeof gameOption === "number" || typeof gameOption === "string") {
      const result = (await this.app.services.game.getGameFromIdOrCode(gameOption)).value;
      if (!result) {
        return Result.fail("O jogo informado não existe ou não está cadastrado neste bot.");
      }
      game = result;
    } else {
      game = gameOption;
    }

    options.filter = { gameId: game.id };
    return Result.success(await this.app.repos.race.findMany(options));
  }

  @transactional()
  @check(hasPermission(Permissions.race.create),
    (args: [RaceCreateParams]) => [args[0].game] as [GameModel]
  )
  async createRace(createOpts: RaceCreateParams) {
    const user = this.app.services.auth.getLoggedUser(true).value;
    const { game, gameMode, registrationDeadline, seedUrl, seedHash } = createOpts;

    // TODO: validate seedUrl and seedHash

    return Result.success(await this.app.models.race.create({
      gameId: game.id,
      gameModeId: gameMode.id,
      creatorId: user.id,
      status: RaceStatus.OPEN,
      registrationDeadline: registrationDeadline ? registrationDeadline : new Date(),
      data: {
        randomizer: { seedUrl, seedHash }
      }
    }));
  }
}
