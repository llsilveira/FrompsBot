"use strict";

const path = require("path");
const { structuredClone } = require("@frompsbot/common/helpers");

module.exports = class ConfigLoader {
  constructor({ app }) {
    this.#app = app;
    this.#cache = new Map();
  }

  get app() {
    return this.#app;
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
};
