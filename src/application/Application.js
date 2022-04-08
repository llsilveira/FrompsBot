"use strict";

const { ApplicationError } = require("./errors");
const LoggerFactory = require("./LoggerFactory");
const { Database } = require("./database");
const { ApplicationModule, ApplicationModuleContainer } = require("./modules");
const ApplicationContext = require("./ApplicationContext");

const { structuredClone } = require("@fromps-bot/common/helpers");


module.exports = class Application {
  static Module = ApplicationModule;
  static Error = ApplicationError;

  constructor(config, modules) {
    this.#config = structuredClone(config);

    this.#loggerFactory = new LoggerFactory(this.#config.logging);
    this.#logger = this.#loggerFactory.getLogger("application");

    this.#db = new Database(this, this.#config.database);

    this.#context = new ApplicationContext(this);

    this.#modules = new ApplicationModuleContainer(this);
    this.#modules.registerModules(modules);
  }

  get context() {
    return this.#context;
  }

  get db() {
    return this.#db;
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
      source = "module " + ident.name;
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
  #db;
  #logger;
  #loggerFactory;
  #modules;
};
