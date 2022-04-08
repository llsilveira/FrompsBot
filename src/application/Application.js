"use strict";

const ApplicationContext = require("./ApplicationContext");
const LoggerFactory = require("./LoggerFactory");
const {
  ApplicationModule, ApplicationModuleContainer, symbols: moduleSymbols
} = require("./modules");
const { ApplicationError } = require("./errors");

const { structuredClone } = require("@fromps-bot/common/helpers");


module.exports = class Application {
  static Module = ApplicationModule;
  static Error = ApplicationError;

  constructor(config, modules) {
    this.#config = structuredClone(config);
    this.#loggerFactory = new LoggerFactory(this.#config.logging);
    this.#logger = this.#loggerFactory.getLogger("application");
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

  getLogger(ident) {
    let source;
    if (ident instanceof Application.Module) {
      source = "module " + ident[moduleSymbols.moduleName];
    } else {
      switch (typeof ident) {
      case "function": {
        source = "function " + ident.name;
        break;
      }
      case "object": {
        source = "unknown object";
        break;
      }
      case "string": {
        source = "#" + ident;
        break;
      }
      case "number":
      case "boolean":
      case "bigint": {
        source = (typeof ident) + " " + ident;
        break;
      }
      default: {
        source = "unknown source";
      }
      }
    }

    return this.#loggerFactory.getLogger(source);
  }

  #config;
  #context;
  #modules;
  #logger;
  #loggerFactory;
};
