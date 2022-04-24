"use strict";

const BaseModule = require("@frompsbot/modules/BaseModule");
const { AuthenticationError } = require("@frompsbot/common/errors");

class AuthController extends BaseModule {

  async login(provider, providerId) {
    // TODO: create different exceptions to represent each error

    if (typeof this.getLoggedUser() !== "undefined") {
      throw AuthenticationError(
        "A user is already logged in in this context");
    }

    const user = await this.app.user.getFromProvider(provider, providerId);
    if (typeof user === "undefined") {
      throw new AuthenticationError(
        `Could not find user: ${provider} - ${providerId}`);
    }

    this.app.context.set(AuthController.loggedUser, user);
  }

  logout() {
    this.app.context.delete(AuthController.loggedUser);
  }

  getLoggedUser() {
    return this.app.context.get(AuthController.loggedUser);
  }

  // Key to store logged user in a context
  static loggedUser = Symbol("AuthController.loggedUser");
}

module.exports = AuthController;
