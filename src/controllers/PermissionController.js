"use strict";

const { Permissions } = require("../constants");

module.exports = class PermissionController {
  constructor(authController, botController, gameController) {
    this.#controllers = Object.freeze({
      auth: authController,
      bot: botController,
      game: gameController
    });
  }


  async [Permissions.bot.addAdmin]() {
    const user = this.#controllers.auth.getLoggedUser();
    return (await this.#controllers.bot.isAdmin(user));
  }

  async [Permissions.bot.removeAdmin]() {
    const user = this.#controllers.auth.getLoggedUser();
    return (await this.#controllers.bot.isAdmin(user));
  }

  async [Permissions.user.changeName](subject) {
    const user = this.#controllers.auth.getLoggedUser();
    return (
      (await this.#controllers.bot.isAdmin(user)) ||
      user.id === subject.id
    );
  }

  async [Permissions.user.create]() {
    const user = this.#controllers.auth.getLoggedUser();
    return (await this.#controllers.bot.isAdmin(user));
  }

  async [Permissions.user.createMode](game) {
    return (await this.#controllers.game.isMonitor(
      game, this.#controllers.auth.getLoggedUser()
    ));
  }

  async [Permissions.user.addMonitor]() {
    const user = this.#controllers.auth.getLoggedUser();
    return (await this.#controllers.bot.isAdmin(user));
  }

  async [Permissions.user.removeMonitor]() {
    const user = this.#controllers.auth.getLoggedUser();
    return (await this.#controllers.bot.isAdmin(user));
  }

  #controllers;
};
