import { AsyncLocalStorage } from "async_hooks";

import Application from "../../Application";
import AppModule from "../../AppModule";

export default class ContextManager extends AppModule {
  constructor(app: Application) {
    super(app);
    this.#asyncStorage = new AsyncLocalStorage();
  }

  get(key: unknown, defaultValue?: unknown) {
    const store = this.#getStore();
    if (store.has(key)) {
      return store.get(key);
    }
    return defaultValue;
  }

  set(key: unknown, value: unknown) {
    this.#getStore().set(key, value);
  }

  delete(key: unknown) {
    return this.#getStore().delete(key);
  }

  #getStore() {
    const store = this.#asyncStorage.getStore() as Map<unknown, unknown>;
    if (!store) {
      throw new Error("Context store is not available.");
    }
    return store;
  }

  run<T extends unknown[], R>(callback: (this: unknown, ...args: T) => R, ...args: T): R {
    return this.#asyncStorage.run(new Map(), callback, ...args);
  }

  #asyncStorage;
}
