"use strict";

const path = require("path");
const awilix = require("awilix");
const winston = require("winston");

const registerModules = require("./modules/registerModules");

const { structuredClone } = require("@frompsbot/common/helpers");

module.exports = class Application {
  constructor(name, instancePath) {
    this.#name = name;
    this.#instancePath = instancePath;
    this.#applicationRoot = module.path;

    this.#config = new ConfigLoader(this);
    this.#logger = new LoggerFactory(this);

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

      user: awilix.asClass(
        require("./modules/core/UserController"), {
          lifetime: awilix.Lifetime.SINGLETON
        }
      ),

      game: awilix.asClass(
        require("./modules/core/GameController"), {
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

  get config() {
    return this.#config;
  }

  get logger() {
    return this.#logger;
  }

  get container() {
    return this.#container;
  }

  get auth() {
    if (!this.#auth) { this.#auth = this.#container.resolve("auth"); }
    return this.#auth;
  }

  get context() {
    if (!this.#context) { this.#context = this.#container.resolve("context"); }
    return this.#context;
  }

  get db() {
    if (!this.#db) { this.#db = this.#container.resolve("db"); }
    return this.#db;
  }

  get game() {
    if (!this.#game) { this.#game = this.#container.resolve("game"); }
    return this.#game;
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
  #config;
  #logger;
  #container;

  #auth;
  #context;
  #db;
  #game;
  #permission;
  #user;
};

class ConfigLoader {
  constructor(app) {
    this.#app = app;
    this.#cache = new Map();
  }

  get(name = "config", overrides = {}) {
    if (!this.#cache.has(name)) {
      const configPath = path.resolve(this.#app.instancePath, "config");

      const configFile = path.resolve(configPath, name);
      const config = require(configFile);
      this.#cache.set(name, config);
    }

    const config = structuredClone(this.#cache.get(name));
    Object.assign(config, overrides);

    return config;
  }

  #app;
  #cache;
}


class LoggerFactory {
  constructor(app) {
    this.#app = app;
    this.#cache = new Map();
    this.#minLevel = 10;

    const defaultSettings = this.#app.config.get("logger");
    const loggers = defaultSettings.loggers || [{}];
    delete defaultSettings.loggers;

    for (const logger of loggers) {
      if ("logFile" in logger) {
        require("winston-daily-rotate-file");
        break;
      }
    }

    this.#logger = winston.createLogger();
    const levels = this.#logger.levels;
    this.#minLevel = Object.values(levels).reduce((c, p) => c > p ? c : p);

    for (const logger of loggers) {
      const loggerConfig = structuredClone(defaultSettings);
      Object.assign(loggerConfig, logger);
      if (!("level" in loggerConfig)) { loggerConfig.level = "warn"; }
      if (!(loggerConfig.level in levels)) {
        throw new Error(`Logger level not found: '${loggerConfig.level}'`);
      }
      if (loggerConfig.level < this.#minLevel) {
        this.#minLevel = loggerConfig.level;
      }

      if (loggerConfig.logFile) {
        this.#logger.add(new winston.transports.DailyRotateFile({
          level: loggerConfig.level,
          dirname: loggerConfig.logPath,
          filename: loggerConfig.logFile + "-%DATE%",
          extension: ".log",
          zippedArchive: loggerConfig.zippedArchive,
          maxSize: loggerConfig.maxSize,
          maxFiles: loggerConfig.maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(), winston.format.json())
        }));
      } else {
        this.#logger.add(new winston.transports.Console({
          level: loggerConfig.level,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize({
              level: true
            }),
            winston.format.simple()
          )
        }));
      }
    }
  }

  getLogger(origin) {
    if (!this.#cache.has(origin)) {
      switch (typeof origin) {
      case "object": {
        const proto = Object.getPrototypeOf(origin);
        if ("constructor" in proto && proto.constructor.name) {
          this.#cache.set(origin, this.#logger.child({
            source: `${proto.constructor.name} instance`
          }));
          break;
        } else {
          this.#cache.set(origin, this.#logger.child({
            source: "Unknown object"
          }));
          break;
        }
      }

      case "function": {
        let name = origin.name;
        if (!(name?.length)) {
          name = "anonymous";
        }
        this.#cache.set(origin, this.#logger.child({
          source: `${name} function`
        }));
        break;
      }

      case "string": {
        this.#cache.set(origin, this.#logger.child({ source: `#${origin}` }));
        break;
      }

      case "bigint":
      case "number":
      case "boolean":
      case "symbol": {
        this.#cache.set(origin, this.#logger.child({
          source: `${typeof origin} ${String.toString(origin)}`
        }));
        break;
      }

      default: {
        this.#cache.set(origin, this.#logger.child({
          source: "Unknown source"
        }));
      }
      }
    }

    return this.#cache.get(origin);
  }

  willLog(level) {
    return this.#logger.levels[level] >= this.#minLevel;
  }

  #app;
  #cache;
  #logger;
  #minLevel;
}
