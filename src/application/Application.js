"use strict";

const ApplicationContext = require("./ApplicationContext");
const { ApplicationModule, ApplicationModuleContainer } = require("./modules");
const { ApplicationError } = require("./errors");


module.exports = class Application {
  static Module = ApplicationModule;
  static Error = ApplicationError;

  constructor(modules) {
    this.#context = new ApplicationContext(this);
    this.#modules = new ApplicationModuleContainer(this);
    this.#modules.registerModules(modules);
  }

  get context() {
    return this.#context;
  }

  run(callback, ...args) {
    this.#context.run(callback, args);
  }

  loadModules(moduleList) {
    return this.#modules.loadModules(moduleList);
  }

  #context;
  #modules;
};
