"use strict";

/**
 * Abstract base class for all application modules.
 */
module.exports = class ApplicationModule {
  constructor(app, name) {
    this.#app = app;
    this.#name = name;
    this.#logger = this.#app.getLogger(this);
  }

  get app() {
    return this.#app;
  }

  get logger() {
    return this.#logger;
  }

  get name() {
    return this.#name;
  }

  #app;
  #logger;
  #name;
};
