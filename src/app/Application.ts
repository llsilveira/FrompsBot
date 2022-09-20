import path = require("path");
import awilix = require("awilix");

import ConfigLoader from "./core/ConfigLoader";
import LoggerFactory from "./core/LoggerFactory";

import { type AwilixContainer } from "awilix";
import type ContextManager from "../modules/ContextManager";
import type Models from "../modules/Models";
import type Services from "../modules/Services";
import type Database from "../modules/Database";


export default class Application {
  readonly name: string;
  readonly instancePath: string;
  readonly applicationRoot;
  readonly config: ConfigLoader;
  readonly logger: LoggerFactory;

  private container: AwilixContainer;

  constructor(name: string, instancePath: string) {
    this.name = name;
    this.instancePath = instancePath;
    this.applicationRoot = path.dirname(module.path);

    this.config = new ConfigLoader(this);
    this.logger = new LoggerFactory(this);

    this.container = awilix.createContainer({
      injectionMode: awilix.InjectionMode.CLASSIC
    });

    this.container.register({
      app: awilix.asValue(this)
    });

    // Register core modules
    this.container.loadModules([
      this.applicationRoot + "/app/core/modules/*.js"
    ], {
      formatName: "camelCase",
      resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asClass
      }
    });

    // Register core models
    this.container.loadModules([
      this.applicationRoot + "/app/core/models/*.js"
    ], {
      formatName: "camelCase",
      resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asFunction
      }
    });

    // Register core services
    this.container.loadModules([
      this.applicationRoot + "/app/core/services/*.js"
    ], {
      formatName: "camelCase",
      resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asClass
      }
    });

    // Register modules
    this.container.loadModules([
      this.applicationRoot + "/modules/*.js"
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

  get context(): ContextManager {
    if (!this._context) {
      this._context = this.container.resolve("contextManager") as ContextManager;
    }
    return this._context;
  }

  get models() {
    if (!this._models) {
      this._models = this.container.resolve("models") as Models;
    }
    return this._models;
  }

  get services(): Services {
    if (!this._services) {
      this._services = this.container.resolve("services") as Services;
    }
    return this._services;
  }

  get database(): Database {
    if (!this._database) {
      this._database = this.container.resolve("db") as Database;
    }
    return this._database;
  }

  getModule<T>(moduleName: string): T {
    return this.container.resolve(moduleName) as T;
  }

  private _context: ContextManager | undefined;
  private _models: Models | undefined;
  private _services: Services | undefined;
  private _database: Database | undefined;
}
