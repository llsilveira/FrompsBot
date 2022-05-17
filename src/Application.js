"use strict";

const awilix = require("awilix");
const registerModules = require("./modules/registerModules");

module.exports = class Application {
  constructor(name, instancePath) {
    this.#name = name;
    this.#instancePath = instancePath;
    this.#applicationRoot = module.path;

    this.#container = awilix.createContainer({
      injectionMode: awilix.InjectionMode.PROXY
    });

    // Register app values
    this.#container.register({
      app: awilix.asValue(this),
      instancePath: awilix.asValue(this.#instancePath)
    });

    // Registering core modules.
    this.#container.register({
      config: awilix.asClass(
        require("./modules/core/ConfigLoader"), {
          lifetime: awilix.Lifetime.SINGLETON
        }
      ),

      context: awilix.asClass(
        require("./modules/core/ContextManager"), {
          lifetime: awilix.Lifetime.SINGLETON
        }
      ),

      db: awilix.asClass(
        require("./modules/core/Database"), {
          lifetime: awilix.Lifetime.SINGLETON
        }
      ),

      logger: awilix.asClass(
        require("./modules/core/LoggerFactory"), {
          lifetime: awilix.Lifetime.SINGLETON
        }
      ),

      user: awilix.asClass(
        require("./modules/core/UserController"), {
          lifetime: awilix.Lifetime.SINGLETON
        }
      ),

      auth: awilix.asClass(
        require("./modules/core/AuthController"), {
          lifetime: awilix.Lifetime.SINGLETON
        }
      ),

      permission: awilix.asClass(
        require("./modules/core/PermissionValidator"), {
          lifetime: awilix.Lifetime.SINGLETON
        }
      ),
    });

    // Registering external modules
    registerModules(this.#container);
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

  get auth() {
    if (!this.#auth) { this.#auth = this.#container.resolve("auth"); }
    return this.#auth;
  }

  get config() {
    if (!this.#config) { this.#config = this.#container.resolve("config"); }
    return this.#config;
  }

  get context() {
    if (!this.#context) { this.#context = this.#container.resolve("context"); }
    return this.#context;
  }

  get db() {
    if (!this.#db) { this.#db = this.#container.resolve("db"); }
    return this.#db;
  }

  get logger() {
    if (!this.#logger) { this.#logger = this.#container.resolve("logger"); }
    return this.#logger;
  }

  get permission() {
    if (!this.#permission) {
      this.#permission = this.#container.resolve("permission");
    }
    return this.#permission;
  }

  get user() {
    if (!this.#user) { this.#user = this.#container.resolve("user"); }
    return this.#user;
  }


  #name;
  #instancePath;
  #applicationRoot;
  #container;

  #auth;
  #config;
  #context;
  #db;
  #logger;
  #permission;
  #user;
};
