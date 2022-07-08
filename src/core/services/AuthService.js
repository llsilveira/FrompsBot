"use strict";

const AppModule = require("../../app/AppModule");
const { AuthenticationError } = require("../../errors");

module.exports = class AuthService extends AppModule {
  login(user) {
    // TODO: create different exceptions to represent each error

    if (typeof this.getLoggedUser() !== "undefined") {
      throw AuthenticationError(
        "A user is already logged in in this context");
    }

    this.app.context.set(AuthService.loggedUser, user);
  }

  logout() {
    this.app.context.delete(AuthService.loggedUser);
  }

  getLoggedUser() {
    return this.app.context.get(AuthService.loggedUser);
  }

  // Key to store logged user in a context
  static loggedUser = Symbol("AuthService.loggedUser");
};
