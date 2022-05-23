"use strict";

module.exports = class BaseModule {
  constructor({ app }) {
    this.#app = app;
  }

  get app() {
    return this.#app;
  }

  get logger() {
    if (!this.#logger) {
      this.#logger = this.#app.logger.getLogger(this);
    }
    return this.#logger;
  }

  #app;
  #logger;
};
