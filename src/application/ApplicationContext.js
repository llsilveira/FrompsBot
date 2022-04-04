"use strict";

const { AsyncLocalStorage } = require("async_hooks");
const { ApplicationError } = require("./ApplicationError");

module.exports = class ApplicationContext {
  constructor() {
    this.#asyncStorage = new AsyncLocalStorage();
  }

  run(callback, args) {
    this.#asyncStorage.run(new Map(), callback, ...args);
  }

  get(key, defaultValue) {
    const store = this.#getStore();
    if (store.public.has(key)) {
      return store.public.get(key);
    }
    return defaultValue;
  }

  set(key, value) {
    this.#getStore().public.set(key, value);
  }

  delete(key) {
    return this.#getStore().public.delete(key);
  }

  #getStore() {
    const store = this.#asyncStorage.getStore();
    if (!store) {
      throw new ApplicationError("Context store is not available.");
    }
    return store;
  }

  #asyncStorage;
};
