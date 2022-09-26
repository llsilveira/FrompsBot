import { Attributes, FindOptions } from "sequelize";

import Application from "../../Application";
import Permissions from "../../../constants/Permissions";
import AppModule from "../../AppModule";
import { GameModeModel } from "../models/gameModeModel";

import check from "../../../decorators/check";
import transactional from "../../../decorators/transactional";
import hasPermission from "../../../constraints/hasPermission";
import { RaceModel } from "../models/raceModel";
import { GameModel } from "../models/gameModel";
import RaceStatus from "../../../constants/RaceStatus";


export type RandomizerRaceData = {
  seedUrl: string,
  seedHash: string
}

declare module "../models/raceModel" {
  interface RaceData {
    randomizer?: RandomizerRaceData
  }
}

export interface IRaceServiceOptions {
  pagination?: { pageSize: number, pageNumber: number };
  limit?: number;
}

export interface IRaceServiceCreateRaceArgs {
  game: GameModel,
  gameMode: GameModeModel,
  registrationDeadline: Date,
  seedUrl: string,
  seedHash: string,
}

export interface IRaceServiceUpdateRaceArgs
  extends Partial<IRaceServiceCreateRaceArgs> {}

export interface IRaceServiceRaceOptions extends IRaceServiceOptions {
  includeEntries?: boolean
  includeGame?: boolean,
  includeGameMode?: boolean,
  includeCreator?: boolean,
  includeRaceGroup?: boolean
}


export default class RaceService extends AppModule {
  constructor(app: Application) {
    super(app);
  }

  async listRaces(options?: IRaceServiceRaceOptions) {
    const queryOptions = this.processRaceQueryOptions(options);
    return await this.app.models.race.findAll(queryOptions);
  }

  async listAndCountRaces(options?: IRaceServiceRaceOptions) {
    const queryOptions = this.processRaceQueryOptions(options);
    return await this.app.models.race.findAndCountAll(queryOptions);
  }

  async getRaceById(raceId: number, options?: IRaceServiceRaceOptions) {
    const queryOptions = this.processRaceQueryOptions(options);
    return await this.app.models.race.findOne({
      ...queryOptions,
      where: { id: raceId }
    });
  }

  @transactional()
  @check(hasPermission(Permissions.race.create),
    (args: [IRaceServiceCreateRaceArgs]) => [args[0].game] as [GameModel]
  )
  async createRace(createOpts: IRaceServiceCreateRaceArgs) {
    const user = this.app.services.auth.getLoggedUser(true).value;
    const { game, gameMode, registrationDeadline, seedUrl, seedHash } = createOpts;

    // TODO: validate seedUrl and seedHash

    return await this.app.models.race.create({
      gameId: game.id,
      gameModeId: gameMode.id,
      creatorId: user.id,
      status: RaceStatus.OPEN,
      registrationDeadline: registrationDeadline,
      data: {
        randomizer: { seedUrl, seedHash }
      }
    });
  }

  private processQueryOptions<T extends RaceModel>(
    options: IRaceServiceOptions = {}
  ) {
    const queryOptions: FindOptions<Attributes<T>> = {};

    if (options?.pagination) {
      const { pageSize, pageNumber } = options.pagination;

      queryOptions.limit = pageSize;
      queryOptions.offset = (pageNumber - 1) * pageSize;
    } else if (options.limit) {
      queryOptions.limit = options.limit;
    }

    // Default: reverse order by created date
    // TODO: give more options
    queryOptions.order = ["created_at", "DESC"];

    return queryOptions;
  }

  private processRaceQueryOptions(
    options?: IRaceServiceRaceOptions
  ) {
    const queryOptions = this.processQueryOptions<RaceModel>(options);

    if (options && (
      options.includeEntries ||
      options.includeGame ||
      options.includeGameMode ||
      options. includeCreator ||
      options.includeRaceGroup
    )) {
      queryOptions.include = [];

      if (options?.includeEntries) {
        queryOptions.include.push("entries");
      }

      if (options?.includeGame) {
        queryOptions.include.push("game");
      }

      if (options?.includeGameMode) {
        queryOptions.include.push("gameMode");
      }

      if (options?.includeCreator) {
        queryOptions.include.push("creator");
      }

      if (options?.includeRaceGroup) {
        queryOptions.include.push("raceGroup");
      }
    }


    return queryOptions;
  }
}
