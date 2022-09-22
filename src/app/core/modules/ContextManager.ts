import { AsyncLocalStorage } from "async_hooks";

import Application from "../../Application";
import AppModule from "../../AppModule";


// Any consumer that wants to store values on the context should extend this
export interface ContextTypeMap {}


export default class ContextManager extends AppModule {
  constructor(app: Application) {
    super(app);
    this.asyncStorage = new AsyncLocalStorage();
  }


  run<T extends unknown[], R>(
    callback: (this: unknown, ...args: T) => R, ...args: T
  ): R {
    return this.asyncStorage.run(new Map(), callback, ...args);
  }


  has(key: keyof ContextTypeMap) {
    return this.getStore().has(key);
  }

  get<K extends keyof ContextTypeMap>(key: K): ContextTypeMap[K] | undefined
  get<K extends keyof ContextTypeMap>(
    key: K, defaultValue: ContextTypeMap[K]
  ): ContextTypeMap[K]
  get<K extends keyof ContextTypeMap>(
    key: K, defaultValue?: ContextTypeMap[K]
  ): ContextTypeMap[K] | undefined {
    const store = this.getStore();
    if (!store.has(key)) {
      return defaultValue;
    }
    return store.get(key) as ContextTypeMap[K];
  }

  set<K extends keyof ContextTypeMap>(key: K, value: ContextTypeMap[K]) {
    return this.getStore().set(key, value);
  }

  delete<K extends keyof ContextTypeMap>(key: K) {
    return this.getStore().delete(key);
  }


  private getStore() {
    const store = this.asyncStorage.getStore();
    if (!store) {
      throw new Error("Context store is not available.");
    }
    return store;
  }

  private asyncStorage: AsyncLocalStorage<Map<keyof ContextTypeMap, unknown>>;
}
