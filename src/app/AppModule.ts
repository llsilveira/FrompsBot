import { RESOLVER } from "awilix";
import type Application from "./Application";


export type AppModuleClass = typeof AppModule;

export default abstract class AppModule {
  static [RESOLVER]: { name?: string } = {};

  static setModuleName(moduleClass: AppModuleClass, name: string) {
    moduleClass[RESOLVER] = { name };
  }

  constructor(app: Application) {
    this.app = app;
    this.logger = app.logger.getLogger(this);
  }

  readonly app: Application;
  readonly logger;
}
