"use strict";


const path = require("path");
const { structuredClone } = require("../helpers");

module.exports = class ConfigLoader {
  constructor(app) {
    this.#instancePath = app.instancePath;
    this.#cache = new Map();
  }

  get(name = "config", overrides = {}) {
    if (!this.#cache.has(name)) {
      const configPath = path.resolve(this.#instancePath, "config");

      const configFile = path.resolve(configPath, name);
      const config = require(configFile);
      this.#cache.set(name, config);
    }

    const config = structuredClone(this.#cache.get(name));
    Object.assign(config, overrides);

    return config;
  }

  #instancePath;
  #cache;
};
