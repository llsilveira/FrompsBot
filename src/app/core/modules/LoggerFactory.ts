import winston = require("winston");
import "winston-daily-rotate-file";

import type Application from "../../Application";


interface FileLoggerOptions {
  level: string,
  logPath: string,
  logFile: string,
  maxSize: string,
  maxFiles: string,
  zippedArchive: boolean
}

interface ConsoleLoggerOptions {
  level: string,
  logFile: undefined
}

type LoggerOptions = FileLoggerOptions | ConsoleLoggerOptions;

interface LoggerSettings extends Partial<Omit<FileLoggerOptions, "logFile">> {
  loggers?: Partial<LoggerOptions>[]
}


export default class LoggerFactory {
  constructor(app: Application) {
    this._cache = new Map();
    this._minLevel = 10;

    const settings = app.config.get<LoggerSettings>("logger");
    const { loggers = [{}], ...defaultSettings } = settings;

    // TODO: validate settings

    this._logger = winston.createLogger({ levels: winston.config.npm.levels });

    const levels = this._logger.levels;
    this._minLevel = Object.values(levels).reduce((c, p) => c > p ? c : p);

    for (const logger of loggers) {
      const loggerConfig = Object.assign({}, defaultSettings, logger);

      if (!("level" in loggerConfig)) { loggerConfig.level = "warn"; }
      const level = loggerConfig.level as string;

      if (!(level in levels)) {
        throw new Error(`Logger level not found: '${level}'`);
      }
      if (levels[level] < this._minLevel) {
        this._minLevel = levels[level];
      }

      if (loggerConfig.logFile) {
        this._logger.add(new winston.transports.DailyRotateFile({
          level: loggerConfig.level?.toString(),
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
        this._logger.add(new winston.transports.Console({
          level: level.toString(),
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

  getLogger(origin: unknown) {
    if (!this._cache.has(origin)) {
      let source: string;

      switch (typeof origin) {
      case "object": {
        const proto = Object.getPrototypeOf(origin) as object;
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
        source = `${typeof origin} ${origin.toString()}`;
        break;
      }

      default: {
        source = "Unknown source";
      }
      }
      this._cache.set(origin, this._logger.child({ source }));
    }

    return this._cache.get(origin) as winston.Logger;
  }

  willLog(level: string): boolean {
    const levelNumber = this._logger.levels[level];
    if (levelNumber === undefined) { return false; }
    return levelNumber >= this._minLevel;
  }

  private _cache: Map<unknown, winston.Logger>;
  private _logger: winston.Logger;
  private _minLevel: number;
}
