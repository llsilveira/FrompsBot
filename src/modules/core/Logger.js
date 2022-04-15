"use strict";


const winston = require("winston");
const { structuredClone } = require("@frompsbot/common/helpers");


module.exports = class LoggerFactory {
  constructor({ config }) {
    this.#cache = {};

    const defaultSettings = structuredClone(config);
    const loggers = defaultSettings.loggers || [{}];
    delete defaultSettings.loggers;

    for (const logger of loggers) {
      if ("logFile" in logger) {
        require("winston-daily-rotate-file");
        break;
      }
    }

    const transports = [];
    for (const logger of loggers) {
      const loggerConfig = structuredClone(defaultSettings);
      Object.assign(loggerConfig, logger);
      if (!("level" in loggerConfig)) { loggerConfig.level = "warn"; }

      if (loggerConfig.logFile) {
        transports.push(new winston.transports.DailyRotateFile({
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
        transports.push(new winston.transports.Console({
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

    this.#factory = winston.createLogger({ transports });
  }

  getLogger(source) {
    if (!(source in this.#cache)) {
      this.#cache[source] = this.#factory.child({ source });
    }
    return this.#cache[source];
  }

  #factory;
  #cache;
};
