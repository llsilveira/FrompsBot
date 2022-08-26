import AppModule from "../../app/AppModule";

import type Application from "../../app/Application";
import type AuthService from "../services/AuthService";
import type BotService from "../services/BotService";
import type GameService from "../services/GameService";
import type PermissionService from "../services/PermissionService";
import type UserService from "../services/UserService";


export default class Services extends AppModule {
  readonly auth: AuthService;
  readonly bot: BotService;
  readonly game: GameService;
  readonly permission: PermissionService;
  readonly user: UserService;

  constructor(
    app: Application,
    authService: AuthService,
    botService: BotService,
    gameService: GameService,
    permissionService: PermissionService,
    userService: UserService
  ) {
    super(app);

    this.auth = authService;
    this.bot = botService;
    this.game = gameService;
    this.permission = permissionService;
    this.user = userService;
  }
}
