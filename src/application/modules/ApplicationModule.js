"use strict";

/**
 * Abstract base class for all application modules.
 */
module.exports = class ApplicationModule {
  constructor(app) {
    this.#app = app;
  }

  get app() {
    return this.#app;
  }

  #app;
};
