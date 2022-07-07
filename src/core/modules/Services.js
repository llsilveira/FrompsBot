"use strict";

const AppModule = require("../../app/AppModule");

module.exports = class Services extends AppModule {
  constructor(
    app,
    authService,
    botService,
    gameService,
    permissionService,
    userService
  ) {
    super(app);

    this.#services = {
      auth: authService,
      bot: botService,
      game: gameService,
      permission: permissionService,
      user: userService,
    };
  }

  get auth() {
    return this.#services.auth;
  }

  get bot() {
    return this.#services.bot;
  }

  get game() {
    return this.#services.game;
  }

  get permission() {
    return this.#services.permission;
  }

  get user() {
    return this.#services.user;
  }

  #services;
};
