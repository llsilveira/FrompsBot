"use strict";

const path = require("path");
const awilix = require("awilix");

const ConfigLoader = require("./ConfigLoader");
const LoggerFactory = require("./LoggerFactory");

module.exports = class Application {
  constructor(name, instancePath) {
    this.#name = name;
    this.#instancePath = instancePath;
    this.#applicationRoot = path.dirname(module.path);

    this.#config = new ConfigLoader(this);
    this.#logger = new LoggerFactory(this);

    this.#container = awilix.createContainer({
      injectionMode: awilix.InjectionMode.CLASSIC
    });

    this.#container.register({
      app: awilix.asValue(this)
    });

    // Register models
    this.#container.loadModules([
      this.#applicationRoot + "/models/*.js"
    ], {
      formatName: "camelCase",
      resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asFunction
      }
    });

    // Register controllers
    this.#container.loadModules([
      this.#applicationRoot + "/controllers/*.js"
    ], {
      formatName: "camelCase",
      resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asClass
      }
    });

    // Register modules
    this.#container.loadModules([
      this.#applicationRoot + "/modules/*.js"
    ], {
      formatName: "camelCase",
      resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asClass
      }
    });
  }

  get app() {
    return this;
  }

  get name() {
    return this.#name;
  }

  get instancePath() {
    return this.#instancePath;
  }

  get applicationRoot() {
    return this.#applicationRoot;
  }

  get container() {
    return this.#container;
  }

  get config() {
    return this.#config;
  }

  get logger() {
    return this.#logger;
  }

  #name;
  #instancePath;
  #applicationRoot;
  #container;

  #config;
  #logger;
};
