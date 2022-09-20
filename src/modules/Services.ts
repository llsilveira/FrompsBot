import AppModule from "../app/AppModule";

import type Application from "../app/Application";
import type AuthService from "../app/core/services/AuthService";
import type BotService from "../app/core/services/BotService";
import type GameService from "../app/core/services/GameService";
import type PermissionService from "../app/core/services/PermissionService";
import type UserService from "../app/core/services/UserService";
import RaceService from "../app/core/services/RaceService";


export default class Services extends AppModule {
  readonly auth: AuthService;
  readonly bot: BotService;
  readonly game: GameService;
  readonly permission: PermissionService;
  readonly race: RaceService;
  readonly user: UserService;

  constructor(
    app: Application,
    authService: AuthService,
    botService: BotService,
    gameService: GameService,
    permissionService: PermissionService,
    raceService: RaceService,
    userService: UserService
  ) {
    super(app);

    this.auth = authService;
    this.bot = botService;
    this.game = gameService;
    this.permission = permissionService;
    this.race = raceService;
    this.user = userService;
  }
}
