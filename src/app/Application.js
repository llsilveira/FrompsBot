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

    // Register core modules
    this.#container.loadModules([
      this.#applicationRoot + "/core/modules/*.js"
    ], {
      formatName: "camelCase",
      resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asClass
      }
    });

    // Register core models
    this.#container.loadModules([
      this.#applicationRoot + "/core/models/*.js"
    ], {
      formatName: "camelCase",
      resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asFunction
      }
    });

    // Register core services
    this.#container.loadModules([
      this.#applicationRoot + "/core/services/*.js"
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

  get context() {
    if (!this.#context) {
      this.#context = this.container.resolve("contextManager");
    }
    return this.#context;
  }

  get models() {
    if (!this.#models) {
      this.#models = this.container.resolve("models");
    }
    return this.#models;
  }

  get services() {
    if (!this.#services) {
      this.#services = this.container.resolve("services");
    }
    return this.#services;
  }

  #name;
  #instancePath;
  #applicationRoot;
  #container;

  #config;
  #logger;

  #context;
  #models;
  #services;
};
