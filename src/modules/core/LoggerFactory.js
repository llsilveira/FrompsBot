"use strict";

const winston = require("winston");
const { structuredClone } = require("@frompsbot/common/helpers");

const BaseModule = require("@frompsbot/modules/BaseModule");

module.exports = class LoggerFactory extends BaseModule {
  constructor({ app, config }) {
    super({ app });
    this.#cache = new Map();
    this.#minLevel = 10;

    const defaultSettings = config.get("logger");
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

  #cache;
  #logger;
  #minLevel;
};
