import Application from "../app/Application";
import AppModule from "../app/AppModule";
import { GameModelClass } from "../app/core/models/gameModel";
import { GameModeModelClass } from "../app/core/models/gameModeModel";
import { RaceEntryModelClass } from "../app/core/models/raceEntryModel";
import { RaceModelClass } from "../app/core/models/raceModel";
import { UserAccountModelClass } from "../app/core/models/userAccountModel";
import { UserModelClass } from "../app/core/models/userModel";


export default class Models extends AppModule {
  readonly game: GameModelClass;
  readonly gameMode: GameModeModelClass;
  readonly raceEntry: RaceEntryModelClass;
  readonly race: RaceModelClass;
  readonly userAccount: UserAccountModelClass;
  readonly user: UserModelClass;

  constructor(
    app: Application,
    gameModel: GameModelClass,
    gameModeModel: GameModeModelClass,
    raceEntryModel: RaceEntryModelClass,
    raceModel: RaceModelClass,
    userAccountModel: UserAccountModelClass,
    userModel: UserModelClass
  ) {
    super(app);

    this.game = gameModel;
    this.gameMode = gameModeModel;
    this.raceEntry = raceEntryModel;
    this.race = raceModel;
    this.userAccount = userAccountModel;
    this.user = userModel;
  }
}
