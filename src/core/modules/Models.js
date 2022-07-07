"use strict";

const AppModule = require("../../app/AppModule");

module.exports = class Models extends AppModule {
  constructor(
    app,
    gameModel,
    gameModeModel,
    raceEntryModel,
    raceModel,
    userAccountModel,
    userModel
  ) {
    super(app);

    this.#models = {
      game: gameModel,
      gameMode: gameModeModel,
      raceEntry: raceEntryModel,
      raceModel: raceModel,
      userAccount: userAccountModel,
      user: userModel
    };
  }

  get game() {
    return this.#models.game;
  }

  get gameMode() {
    return this.#models.gameMode;
  }

  get raceEntry() {
    return this.#models.raceEntry;
  }

  get race() {
    return this.#models.race;
  }

  get userAccount() {
    return this.#models.userAccount;
  }

  get user() {
    return this.#models.user;
  }

  #models;
};
