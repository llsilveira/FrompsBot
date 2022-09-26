import AppModule from "../../AppModule";

import type Application from "../../Application";
import UserAccountRepository from "../repositories/UserAccountRepository";

export default class Repositories extends AppModule {
  readonly userAccount: UserAccountRepository;

  constructor(app: Application) {
    super(app);

    this.userAccount = new UserAccountRepository(app.models.userAccount);
  }
}
