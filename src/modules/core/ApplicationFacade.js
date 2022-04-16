"use strict";

module.exports = class ApplicationFacade {
  constructor({ container, database: db }) {
    this.#container = container;
    this.#db = db;
  }

  #container;
  #db;
};
