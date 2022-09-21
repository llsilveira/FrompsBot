import AppModule from "../../AppModule";

import type Application from "../../Application";
import AuthService from "../services/AuthService";
import BotService from "../services/BotService";
import GameService from "../services/GameService";
import PermissionService from "../services/PermissionService";
import UserService from "../services/UserService";
import RaceService from "../services/RaceService";


export default class Services extends AppModule {
  readonly auth: AuthService;
  readonly bot: BotService;
  readonly game: GameService;
  readonly permission: PermissionService;
  readonly race: RaceService;
  readonly user: UserService;

  constructor(app: Application) {
    super(app);

    this.auth = new AuthService(app);
    this.bot = new BotService(app);
    this.game = new GameService(app);
    this.race = new RaceService(app);
    this.user = new UserService(app);
    this.permission = new PermissionService(app, this.auth, this.bot, this.game);
  }
}
