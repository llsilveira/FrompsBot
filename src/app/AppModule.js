"use strict";

const { RESOLVER } = require("awilix");

module.exports = class AppModule {
  static setModuleName(moduleClass, name) {
    moduleClass[RESOLVER] = { name };
  }

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.getLogger(this);
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
