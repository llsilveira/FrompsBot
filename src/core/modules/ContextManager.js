"use strict";

const { AsyncLocalStorage } = require("async_hooks");

const { AppModule } = require("../../app");

module.exports = class ContextManager extends AppModule {
  constructor(app) {
    super(app);
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
    return this.#asyncStorage.run(new Map(), callback, ...args);
  }

  #asyncStorage;
};
