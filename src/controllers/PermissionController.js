"use strict";

const { Permissions } = require("../constants");

module.exports = class PermissionController {
  constructor(authController, userController) {
    this.#controllers = Object.freeze({
      auth: authController,
      user: userController
    });
  }

  async [Permissions.USER.changeName](subject) {
    const user = this.#controllers.auth.getLoggedUser();
    return ((await this.#controllers.user.isAdmin(user)) || user.id === subject.id);
  }

  async [Permissions.GAME.create]() {
    return (await this.#controllers.user.isAdmin(this.#controllers.auth.getLoggedUser()));
  }

  async [Permissions.GAME.createMode](gameCode) {
    return (await this.#controllers.game.isMonitor(
      gameCode, this.#controllers.auth.getLoggedUser()
    ));
  }

  #controllers;
};
