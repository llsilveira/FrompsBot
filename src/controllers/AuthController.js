"use strict";

const { AuthenticationError } = require("../errors");

module.exports = class AuthController {
  constructor(context) {
    this.#context = context;
  }

  async login(user) {
    // TODO: create different exceptions to represent each error

    if (typeof this.getLoggedUser() !== "undefined") {
      throw AuthenticationError(
        "A user is already logged in in this context");
    }

    this.#context.set(AuthController.loggedUser, user);
  }

  logout() {
    this.#context.delete(AuthController.loggedUser);
  }

  getLoggedUser() {
    return this.#context.get(AuthController.loggedUser);
  }

  #context;

  // Key to store logged user in a context
  static loggedUser = Symbol("AuthController.loggedUser");
};
