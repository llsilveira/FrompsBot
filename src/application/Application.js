"use strict";

const { ApplicationContext } = require("./context");

module.exports = class Application {
  constructor() {
    this.#context = new ApplicationContext(this);
  }

  get context() {
    return this.#context;
  }

  run(callback, ...args) {
    this.#context.run(callback, args);
  }

  #context;
};
