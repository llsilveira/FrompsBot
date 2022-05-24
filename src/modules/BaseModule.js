"use strict";

module.exports = class BaseModule {
  constructor({ app }) {
    this.#app = app;
    this.#logger = this.#app.logger.getLogger(this);
  }

  get app() {
    return this.#app;
  }

  get logger() {
    return this.#logger;
  }

  #app;
  #logger;
};
