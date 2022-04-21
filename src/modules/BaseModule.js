"use strict";

module.exports = class BaseModule {
  constructor({ app }) {
    this.#app = app;
  }

  get app() {
    return this.#app;
  }

  #app;
};