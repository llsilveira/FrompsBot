"use strict";

const winston = require("winston");

module.exports = class LoggerFactory {
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
      if (levels[loggerConfig.level] < this.#minLevel) {
        this.#minLevel = levels[loggerConfig.level];
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
            winston.format.splat(),
            winston.format.timestamp(),
            winston.format.json()
          )
        }));
      } else {
        this.#logger.add(new winston.transports.Console({
          level: loggerConfig.level,
          format: winston.format.combine(
            winston.format.splat(),
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
      let source;
      switch (typeof origin) {
      case "object": {
        const proto = Object.getPrototypeOf(origin);
        if ("constructor" in proto && proto.constructor.name) {
          source = `${proto.constructor.name} instance`;
          break;
        } else {
          source = "Unknown object";
          break;
        }
      }

      case "function": {
        let name = origin.name;
        if (!(name?.length)) {
          name = "anonymous";
        }
        source = `${name} function`;
        break;
      }

      case "string": {
        source = `#${origin}`;
        break;
      }

      case "bigint":
      case "number":
      case "boolean":
      case "symbol": {
        source = `${typeof origin} ${String.toString(origin)}`;
        break;
      }

      default: {
        source = "Unknown source";
      }
      }
      this.#cache.set(origin, this.#logger.child({ source }));
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
};
