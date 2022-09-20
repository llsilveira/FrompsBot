import path = require("path");

import structuredClone from "../../helpers/structuredClone";
import type Application from "../Application";


export default class ConfigLoader {
  constructor(app: Application) {
    this.app = app;
    this._cache = new Map<string, unknown>();
  }

  get<T extends Object>(name: string = "config", overrides: Partial<T> = {}): T {
    if (!this._cache.has(name)) {
      const configPath = path.resolve(this.app.instancePath, "config");
      const configFile = path.resolve(configPath, name);

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const config = require(configFile) as T;

      // TODO: check if config is indeed Record<string, unknown>

      this._cache.set(name, config);
    }

    const config = structuredClone<T>(this._cache.get(name) as T);
    Object.assign(config, overrides);

    return config;
  }

  readonly app: Application;
  private _cache: Map<string, unknown>;
}
