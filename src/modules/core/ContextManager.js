"use strict";

const { AsyncLocalStorage } = require("async_hooks");

const BaseModule = require("@frompsbot/modules/BaseModule");

module.exports = class ContextManager extends BaseModule {
  constructor({ app }) {
    super ({ app });
    this.#asyncStorage = new AsyncLocalStorage();
  }

  get(key, defaultValue) {
    const store = this.#getStore();
    if (store.has(key)) {
      return store.get(key);
    }
    return defaultValue;
  }

  set(key, value) {
    this.#getStore().set(key, value);
  }

  delete(key) {
    return this.#getStore().delete(key);
  }

  #getStore() {
    const store = this.#asyncStorage.getStore();
    if (!store) {
      throw new Error("Context store is not available.");
    }
    return store;
  }

  run(callback, ...args) {
    this.#asyncStorage.run(new Map(), callback, ...args);
  }

  #asyncStorage;
};
