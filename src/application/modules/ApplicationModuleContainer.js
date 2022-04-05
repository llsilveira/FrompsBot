"use strict";

const { arrayIntersection } = require("@fromps-bot/common/helpers");

const { ApplicationError } = require("../errors");

const symbols = require("./symbols");


module.exports = class ApplicationModuleContainer {
  constructor(app) {
    this.#app = app;
    this.#modules = new Map();
  }

  registerModule(name, config) {
    if (name.indexOf("#") >= 0) {
      throw new ApplicationError(`Invalid module name: '${name}'.`);
    }
    return this._register(name, config);
  }

  registerModules(modules) {
    for (const moduleName in modules) {
      this.registerModule(moduleName, modules[moduleName]);
    }
  }

  getModule(name) {
    return this.#modules.get(name);
  }

  loadModules(modules) {
    if (typeof modules === "undefined") {
      modules = this.#modules.keys().filter((name) => {
        return name.indexOf("#") < 0;
      });
    }

    const loaded = {};
    for (const moduleName of modules) {
      loaded[moduleName] = this.#modules[moduleName].getInstance(this.#app);
    }
    return loaded;
  }

  _register(name, config) {
    if (this.#modules.has(name)) {
      throw new ApplicationError(
        `This application already have a module named '${name}'.`);
    }

    const spec = new ModuleSpec(name, config, this);
    this.#modules.set(name, spec);
  }

  #modules;
  #app;
};


class ModuleSpec {
  #name;
  #type;
  #config;
  #dependencies = {};
  #instance;

  constructor(name, config, container) {
    this.#name = name;

    if (arrayIntersection(config.keys(), ["type", "require"]).length !== 1) {
      throw new ApplicationError(
        `Configuration for module '${name}' must have a 'type' or 'require' property (but not both).`);
    }
    this.#type = config.type || require(config.require);
    this.#config = config.config;

    const dependencies = config.dependencies || {};
    for (const dependencyKey in dependencies) {
      const dependencyValue = dependencies[dependencyKey];

      let dependencyName;
      switch (typeof dependencyValue) {
      case "undefined":
        dependencyName = dependencyKey;
        break;
      case "string":
        dependencyName = dependencyValue;
        break;
      case "object":
        dependencyName = `${name}#${dependencyKey}`;
        container._register(dependencyName, dependencyValue);
        break;
      default:
        throw new ApplicationError(`Malformed dependency for module ${name}.`);
      }

      const spec = container.getModule(dependencyName);
      if (typeof spec === "undefined") {
        throw new ApplicationError(
          `Dependency not found for module ${name}: ${dependencyName}`);
      }

      this.#dependencies[dependencyKey] = spec;
    }
  }

  getInstance(app) {
    if (!this.#instance) {
      const dependencies = {};
      for (const dependency in this.#dependencies) {
        dependencies[dependency] =
          this.#dependencies[dependency].getInstance(app);
      }

      this.#instance = new (this.#type)(app, this.#config, dependencies);
      this.#instance[symbols.moduleName] = this.#name;
    }

    return this.#instance;
  }
}
