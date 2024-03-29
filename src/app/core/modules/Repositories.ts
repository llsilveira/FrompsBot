import AppModule from "../../AppModule";

import type Application from "../../Application";
import UserAccountRepository from "../repositories/UserAccountRepository";
import UserRepository from "../repositories/UserRepository";
import GameRepository from "../repositories/GameRepository";
import GameModeRepository from "../repositories/GameModeRepository";
import RaceRepository from "../repositories/RaceRepository";
import RaceEntryRepository from "../repositories/RaceEntryRepository";


export default class Repositories extends AppModule {
  readonly userAccount: UserAccountRepository;
  readonly user: UserRepository;
  readonly game: GameRepository;
  readonly gameMode: GameModeRepository;
  readonly race: RaceRepository;
  readonly raceEntry: RaceEntryRepository;

  constructor(app: Application) {
    super(app);

    this.userAccount = new UserAccountRepository(app.models.userAccount);
    this.user = new UserRepository(app.models.user);
    this.game = new GameRepository(app.models.game);
    this.gameMode = new GameModeRepository(app.models.gameMode);
    this.race = new RaceRepository(app.models.race);
    this.raceEntry = new RaceEntryRepository(app.models.raceEntry);
  }
}
