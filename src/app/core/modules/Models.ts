import Application from "../../Application";
import AppModule from "../../AppModule";
import createGameModel, { GameModelClass } from "../models/gameModel";
import createGameModeModel, { GameModeModelClass } from "../models/gameModeModel";
import createRaceEntryModel, { RaceEntryModelClass } from "../models/raceEntryModel";
import createRaceGroupModel, { RaceGroupModelClass } from "../models/raceGroupModel";
import createRaceModel, { RaceModelClass } from "../models/raceModel";
import createUserAccountModel, { UserAccountModelClass } from "../models/userAccountModel";
import createUserModel, { UserModelClass } from "../models/userModel";


export default class Models extends AppModule {
  readonly game: GameModelClass;
  readonly gameMode: GameModeModelClass;
  readonly raceEntry: RaceEntryModelClass;
  readonly raceGroup: RaceGroupModelClass;
  readonly race: RaceModelClass;
  readonly userAccount: UserAccountModelClass;
  readonly user: UserModelClass;

  constructor(app: Application) {
    super(app);

    this.user = createUserModel(app);
    this.userAccount = createUserAccountModel(app, this.user);
    this.game = createGameModel(app);
    this.gameMode = createGameModeModel(app, this.game);
    this.raceGroup = createRaceGroupModel(app);
    this.race = createRaceModel(app, this.user, this.game, this.gameMode, this.raceGroup);
    this.raceEntry = createRaceEntryModel(app, this.user, this.race);
  }
}
