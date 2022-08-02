"use strict";

const AppModule = require("../../app/AppModule");
const Permissions = require("../constants/Permissions");

module.exports = class PermissionService extends AppModule {
  constructor(app, authService, botService, gameService) {
    super(app);
    this.#services = Object.freeze({
      auth: authService,
      bot: botService,
      game: gameService
    });
  }

  async [Permissions.bot.listAdmins]() {
    const user = this.#services.auth.getLoggedUser();
    return (await this.#services.bot.isAdmin(user));
  }

  async [Permissions.bot.addAdmin]() {
    const user = this.#services.auth.getLoggedUser();
    return (await this.#services.bot.isAdmin(user));
  }

  async [Permissions.bot.removeAdmin]() {
    const user = this.#services.auth.getLoggedUser();
    return (await this.#services.bot.isAdmin(user));
  }

  async [Permissions.bot.listMonitors](game) {
    const user = this.#services.auth.getLoggedUser();
    return (
      await this.#services.bot.isAdmin(user) ||
      await this.#services.bot.isMonitor(user, game)
    );
  }

  async [Permissions.bot.addMonitor]() {
    const user = this.#services.auth.getLoggedUser();
    return (await this.#services.bot.isAdmin(user));
  }

  async [Permissions.bot.removeMonitor]() {
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
    return (await this.#services.bot.isMonitor(
      this.#services.auth.getLoggedUser(), game
    ));
  }

  async [Permissions.game.removeMode](gameMode) {
    const game = gameMode.game || await this.#services.game.getGameById(gameMode.gameId);
    return (await this.#services.bot.isMonitor(
      this.#services.auth.getLoggedUser(), game
    ));
  }

  #services;
};
