"use strict";

const AppModule = require("../../app/AppModule");
const { Permissions } = require("../../constants");

module.exports = class PermissionService extends AppModule {
  constructor(app, authService, botService, gameService) {
    super(app);
    this.#services = Object.freeze({
      auth: authService,
      bot: botService,
      game: gameService
    });
  }


  async [Permissions.bot.addAdmin]() {
    const user = this.#services.auth.getLoggedUser();
    return (await this.#services.bot.isAdmin(user));
  }

  async [Permissions.bot.removeAdmin]() {
    const user = this.#services.auth.getLoggedUser();
    return (await this.#services.bot.isAdmin(user));
  }

  async [Permissions.user.changeName](subject) {
    const user = this.#services.auth.getLoggedUser();
    return (
      (await this.#services.bot.isAdmin(user)) ||
      user.id === subject.id
    );
  }

  async [Permissions.game.create]() {
    const user = this.#services.auth.getLoggedUser();
    return (await this.#services.bot.isAdmin(user));
  }

  async [Permissions.game.remove]() {
    const user = this.#services.auth.getLoggedUser();
    return (await this.#services.bot.isAdmin(user));
  }

  async [Permissions.game.createMode](game) {
    return (await this.#services.game.isMonitor(
      game, this.#services.auth.getLoggedUser()
    ));
  }

  async [Permissions.game.addMonitor]() {
    const user = this.#services.auth.getLoggedUser();
    return (await this.#services.bot.isAdmin(user));
  }

  async [Permissions.game.removeMonitor]() {
    const user = this.#services.auth.getLoggedUser();
    return (await this.#services.bot.isAdmin(user));
  }

  #services;
};
