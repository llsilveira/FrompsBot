"use strict";

/**
 * Abstract base class for all application modules.
 */
module.exports = class ApplicationModule {
  constructor(app, name) {
    this.#app = app;
    this.#name = name;
  }

  get app() {
    return this.#app;
  }

  get name() {
    return this.#name;
  }

  #app;
  #name;
};
